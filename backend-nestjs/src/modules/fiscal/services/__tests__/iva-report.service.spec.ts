import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IvaReportService } from '../iva-report.service';
import { DeclaracaoIVA, EstadoDeclaracao } from '../../entities/declaracao-iva.entity';
import { Empresa } from '../../../empresas/entities/empresa.entity';
import { Documento } from '../../../documentos/entities/documento.entity';
import { Logger } from '@nestjs/common';

/**
 * Testes unitários para IvaReportService
 * Cobertura: geração de Modelo A, cálculos de IVA, exportação XML
 */
describe('IvaReportService', () => {
  let service: IvaReportService;
  let declaracaoRepo: Repository<DeclaracaoIVA>;
  let empresaRepo: Repository<Empresa>;
  let documentoRepo: Repository<Documento>;

  // Mocks
  const mockDeclaracaoRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
  };

  const mockEmpresaRepo = {
    findOne: jest.fn(),
  };

  const mockDocumentoRepo = {
    find: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      addGroupBy: jest.fn().mockReturnThis(),
      getRawOne: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IvaReportService,
        {
          provide: getRepositoryToken(DeclaracaoIVA),
          useValue: mockDeclaracaoRepo,
        },
        {
          provide: getRepositoryToken(Empresa),
          useValue: mockEmpresaRepo,
        },
        {
          provide: getRepositoryToken(Documento),
          useValue: mockDocumentoRepo,
        },
        Logger,
      ],
    }).compile();

    service = module.get<IvaReportService>(IvaReportService);
    declaracaoRepo = module.get<Repository<DeclaracaoIVA>>(getRepositoryToken(DeclaracaoIVA));
    empresaRepo = module.get<Repository<Empresa>>(getRepositoryToken(Empresa));
    documentoRepo = module.get<Repository<Documento>>(getRepositoryToken(Documento));

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('gerarModeloA', () => {
    const empresaId = '550e8400-e29b-41d4-a716-446655440000';
    const ano = 2024;
    const mes = 1;

    it('deve gerar Modelo A com sucesso', async () => {
      // Arrange
      const mockDeclaracao: Partial<DeclaracaoIVA> = {
        id: 'decl-123',
        empresaId,
        periodoAno: ano,
        periodoMes: mes,
        q1VendasBens16: 10000,
        q1VendasServicos16: 5000,
        q1TotalIva16: 2400,
        estado: EstadoDeclaracao.RASCUNHO,
      };

      mockDeclaracaoRepo.findOne.mockResolvedValue(mockDeclaracao);
      mockDeclaracaoRepo.save.mockResolvedValue(mockDeclaracao);
      mockEmpresaRepo.findOne.mockResolvedValue({
        id: empresaId,
        nuit: '123456789',
        nomeFiscal: 'Empresa Teste',
      });
      mockDocumentoRepo.createQueryBuilder().getRawOne.mockResolvedValue({
        q1VendasBens16: '10000',
        q1VendasServicos16: '5000',
        q1TotalIva16: '2400',
      });

      // Act
      const result = await service.gerarModeloA(empresaId, ano, mes);

      // Assert
      expect(result).toBeDefined();
      expect(result.periodoAno).toBe(ano);
      expect(result.periodoMes).toBe(mes);
      expect(mockDeclaracaoRepo.save).toHaveBeenCalled();
    });

    it('deve lançar erro quando empresa não existe', async () => {
      // Arrange
      mockEmpresaRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.gerarModeloA('invalid-id', ano, mes))
        .rejects
        .toThrow('Empresa não encontrada');
    });
  });

  // Nota: Testes de calcularApuramento removidos - método privado

  describe('gerarXML', () => {
    it('deve gerar XML válido com estrutura correta', async () => {
      // Arrange
      const empresaId = '550e8400-e29b-41d4-a716-446655440000';
      const mockDeclaracao: Partial<DeclaracaoIVA> = {
        id: 'decl-123',
        empresaId,
        periodoAno: 2024,
        periodoMes: 1,
        q1VendasBens16: 10000,
        q1TotalIva16: 1600,
        q6IvaLiquidado: 1600,
        q6IvaDedutivel: 800,
        q6IvaAPagar: 800,
        xmlGerado: null,
      };

      const mockEmpresa = {
        id: empresaId,
        nuit: '123456789',
        nomeFiscal: 'Empresa Teste',
        regime: 'NORMAL',
      };

      mockDeclaracaoRepo.findOne.mockResolvedValue(mockDeclaracao);
      mockDeclaracaoRepo.save.mockImplementation((d) => Promise.resolve(d));
      mockEmpresaRepo.findOne.mockResolvedValue(mockEmpresa);

      // Act
      const xml = await service.gerarXML(empresaId, 2024, 1);

      // Assert
      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<ModeloA');
      expect(xml).toContain('<NUIT>123456789</NUIT>');
      expect(xml).toContain('<Quadro01>');
      expect(xml).toContain('<Quadro06>');
      expect(xml).toContain('</ModeloA>');
    });
  });

  describe('listarDeclaracoes', () => {
    it('deve retornar lista ordenada por período', async () => {
      // Arrange
      const empresaId = '550e8400-e29b-41d4-a716-446655440000';
      const mockDeclaracoes: Partial<DeclaracaoIVA>[] = [
        { id: '1', periodoAno: 2024, periodoMes: 2 },
        { id: '2', periodoAno: 2024, periodoMes: 1 },
        { id: '3', periodoAno: 2023, periodoMes: 12 },
      ];

      mockDeclaracaoRepo.find.mockResolvedValue(mockDeclaracoes);

      // Act
      const result = await service.listarDeclaracoes(empresaId);

      // Assert
      expect(result).toHaveLength(3);
      expect(mockDeclaracaoRepo.find).toHaveBeenCalledWith({
        where: { empresaId },
        order: { periodoAno: 'DESC', periodoMes: 'DESC' },
      });
    });
  });

  describe('submeterDeclaracao', () => {
    it('deve submeter declaração e gerar código de validação', async () => {
      // Arrange
      const empresaId = '550e8400-e29b-41d4-a716-446655440000';
      const declaracaoId = 'decl-123';
      const mockDeclaracao: Partial<DeclaracaoIVA> = {
        id: declaracaoId,
        empresaId,
        estado: EstadoDeclaracao.RASCUNHO,
        numeroConfirmacaoAT: null,
        dataSubmissao: null,
      };

      mockDeclaracaoRepo.findOne.mockResolvedValue(mockDeclaracao);
      mockDeclaracaoRepo.save.mockImplementation((d) => Promise.resolve(d));

      // Act
      const result = await service.submeterDeclaracao(declaracaoId, empresaId);

      // Assert
      expect(result.estado).toBe('SUBMETIDA');
      expect(result.numeroConfirmacaoAT).toBeDefined();
      expect(result.dataSubmissao).toBeInstanceOf(Date);
    });

    it('deve lançar erro se declaração já foi submetida', async () => {
      // Arrange
      const empresaId = '550e8400-e29b-41d4-a716-446655440000';
      const declaracaoId = 'decl-123';
      const mockDeclaracao: Partial<DeclaracaoIVA> = {
        id: declaracaoId,
        empresaId,
        estado: EstadoDeclaracao.SUBMETIDA,
      };

      mockDeclaracaoRepo.findOne.mockResolvedValue(mockDeclaracao);

      // Act & Assert
      await expect(service.submeterDeclaracao(declaracaoId, empresaId))
        .rejects
        .toThrow('Declaração já foi submetida');
    });
  });
});

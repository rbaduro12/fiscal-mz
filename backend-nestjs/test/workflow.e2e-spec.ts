import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * Testes de Integração E2E - Workflow Completo B2B
 * 
 * Cenário: Empresa A envia cotação → Cliente aceita → Gera proforma → 
 *          Processa pagamento → Emite fatura → Movimenta stock
 */
describe('Workflow B2B (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let empresaId: string;
  let cotacaoId: string;
  let proformaId: string;
  let entidadeId: string;
  let artigoId: string;

  // Dados de teste
  const testUser = {
    email: 'test@empresa-a.co.mz',
    password: 'testpassword123',
    nome: 'Utilizador Teste',
  };

  const testEmpresa = {
    nuit: '999999999',
    nomeFiscal: 'Empresa A Teste',
    nomeComercial: 'Empresa A',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // TODO: Setup de dados de teste (seed)
    // Por enquanto, usa dados existentes do seed
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Cenário 1: Fluxo Completo de Venda', () => {
    it('1.1 - Deve autenticar utilizador', async () => {
      // Usa credenciais do seed
      const response = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({
          email: 'admin@fiscal.mz',
          password: 'password123',
        })
        .expect(200);

      expect(response.body.access_token).toBeDefined();
      expect(response.body.user).toBeDefined();
      
      authToken = response.body.access_token;
      empresaId = response.body.user.empresa.id;
    });

    it('1.2 - Deve criar nova entidade (cliente)', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/entidades')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Cliente Teste B2B',
          nuit: '888888888',
          tipo: 'CLIENTE',
          email: 'cliente@teste.co.mz',
          telefone: '+258 84 123 4567',
          endereco: 'Av. Teste, 123',
          cidade: 'Maputo',
        })
        .expect(201);

      expect(response.body.id).toBeDefined();
      entidadeId = response.body.id;
    });

    it('1.3 - Deve criar novo artigo', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/artigos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          codigo: 'ART-TEST-001',
          descricao: 'Artigo Teste Workflow',
          precoUnitario: 1000.00,
          ivaPercent: 16,
          stock: 100,
          categoria: 'Teste',
        })
        .expect(201);

      expect(response.body.id).toBeDefined();
      artigoId = response.body.id;
    });

    it('1.4 - Deve criar cotação', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/cotacoes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          entidadeId: entidadeId,
          itens: [
            {
              artigoId: artigoId,
              quantidade: 10,
              precoUnitario: 1000.00,
              descontoPercent: 0,
            },
          ],
          validadeDias: 30,
        })
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.estado).toBe('EMITIDA');
      expect(response.body.totalPagar).toBe(11600); // 10 * 1000 * 1.16
      
      cotacaoId = response.body.id;
    });

    it('1.5 - Deve aceitar cotação e gerar proforma', async () => {
      const response = await request(app.getHttpServer())
        .post(`/v1/cotacoes/${cotacaoId}/aceitar`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          metodo: 'CASH',
          valorPago: 11600,
        })
        .expect(201);

      expect(response.body.proforma).toBeDefined();
      expect(response.body.proforma.estado).toBe('PAGA');
      
      proformaId = response.body.proforma.id;
    });

    it('1.6 - Deve verificar movimentação de stock', async () => {
      const response = await request(app.getHttpServer())
        .get(`/v1/artigos/${artigoId}/stock`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.stockAtual).toBe(90); // 100 - 10
      expect(response.body.movimentos).toBeDefined();
      expect(response.body.movimentos.length).toBeGreaterThan(0);
    });

    it('1.7 - Deve gerar fatura após pagamento', async () => {
      const response = await request(app.getHttpServer())
        .get(`/v1/proformas/${proformaId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.documentoOrigemId).toBeDefined();
      
      // Verificar fatura
      const faturaResponse = await request(app.getHttpServer())
        .get(`/v1/documentos/${response.body.documentoOrigemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(faturaResponse.body.tipo).toBe('FACTURA');
      expect(faturaResponse.body.hashFiscal).toBeDefined();
      expect(faturaResponse.body.qrCodeData).toBeDefined();
    });
  });

  describe('Cenário 2: Modelo A de IVA', () => {
    it('2.1 - Deve gerar Modelo A para o mês atual', async () => {
      const agora = new Date();
      const response = await request(app.getHttpServer())
        .post(`/v1/fiscal/iva/modelo-a/${agora.getFullYear()}/${agora.getMonth() + 1}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.q1VendasBens16).toBeDefined();
      expect(response.body.q6IvaLiquidado).toBeDefined();
    });

    it('2.2 - Deve exportar XML do Modelo A', async () => {
      const agora = new Date();
      const response = await request(app.getHttpServer())
        .get(`/v1/fiscal/iva/modelo-a/${agora.getFullYear()}/${agora.getMonth() + 1}/xml`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.text).toContain('<?xml version="1.0"');
      expect(response.text).toContain('<ModeloA');
      expect(response.headers['content-type']).toBe('application/xml');
    });

    it('2.3 - Deve exportar PDF do Modelo A', async () => {
      const agora = new Date();
      const response = await request(app.getHttpServer())
        .get(`/v1/fiscal/iva/modelo-a/${agora.getFullYear()}/${agora.getMonth() + 1}/pdf`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Buffer);
      expect(response.headers['content-type']).toBe('application/pdf');
    });
  });

  describe('Cenário 3: Notificações', () => {
    it('3.1 - Deve listar notificações da empresa', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/notificacoes')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('3.2 - Deve marcar notificação como lida', async () => {
      // Primeiro obter uma notificação
      const notificacoes = await request(app.getHttpServer())
        .get('/v1/notificacoes')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      if (notificacoes.body.length > 0) {
        const notifId = notificacoes.body[0].id;

        await request(app.getHttpServer())
          .patch(`/v1/notificacoes/${notifId}/lida`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);
      }
    });
  });
});

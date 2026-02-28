import { DataSource } from 'typeorm';
import { Artigo, TipoArtigo } from '../../modules/artigos/entities/artigo.entity';
import { Empresa } from '../../modules/empresas/entities/empresa.entity';
import { TipoOperacaoIVA } from '../../modules/documentos/entities/documento.entity';

export async function seedArtigos(dataSource: DataSource): Promise<void> {
  const artigoRepo = dataSource.getRepository(Artigo);
  const empresaRepo = dataSource.getRepository(Empresa);

  const empresas = await empresaRepo.find();

  if (empresas.length === 0) {
    console.log('⚠️  Nenhuma empresa encontrada.');
    return;
  }

  const artigos = [
    // Serviços da ABC Comercial
    {
      codigo: 'SERV001',
      descricao: 'Consultoria Fiscal - Hora',
      tipo: TipoArtigo.SERVICO,
      precoVenda: 5000,
      precoCusto: 0,
      stockAtual: 0,
      stockMinimo: 0,
      categoriaIva: TipoOperacaoIVA.TRIBUTAVEL_16,
      empresaNuit: '400123456',
    },
    {
      codigo: 'SERV002',
      descricao: 'Despacho Aduaneiro',
      tipo: TipoArtigo.SERVICO,
      precoVenda: 15000,
      precoCusto: 0,
      stockAtual: 0,
      stockMinimo: 0,
      categoriaIva: TipoOperacaoIVA.TRIBUTAVEL_16,
      empresaNuit: '400123456',
    },
    {
      codigo: 'SERV003',
      descricao: 'Registro de Empresa',
      tipo: TipoArtigo.SERVICO,
      precoVenda: 25000,
      precoCusto: 0,
      stockAtual: 0,
      stockMinimo: 0,
      categoriaIva: TipoOperacaoIVA.TRIBUTAVEL_16,
      empresaNuit: '400123456',
    },
    // Produtos da XYZ Importações
    {
      codigo: 'PROD001',
      descricao: 'Arroz Importado 50kg',
      tipo: TipoArtigo.PRODUTO,
      precoVenda: 3500,
      precoCusto: 2500,
      stockAtual: 1000,
      stockMinimo: 100,
      categoriaIva: TipoOperacaoIVA.TRIBUTAVEL_5, // Taxa reduzida
      empresaNuit: '400654321',
    },
    {
      codigo: 'PROD002',
      descricao: 'Óleo Alimentar 20L',
      tipo: TipoArtigo.PRODUTO,
      precoVenda: 2800,
      precoCusto: 2000,
      stockAtual: 500,
      stockMinimo: 50,
      categoriaIva: TipoOperacaoIVA.TRIBUTAVEL_5, // Taxa reduzida
      empresaNuit: '400654321',
    },
    {
      codigo: 'PROD003',
      descricao: 'Electrodoméstico - Frigorífico',
      tipo: TipoArtigo.PRODUTO,
      precoVenda: 85000,
      precoCusto: 65000,
      stockAtual: 50,
      stockMinimo: 5,
      categoriaIva: TipoOperacaoIVA.TRIBUTAVEL_16,
      empresaNuit: '400654321',
    },
  ];

  for (const artData of artigos) {
    const empresa = empresas.find(e => e.nuit === artData.empresaNuit);
    
    if (!empresa) {
      console.log(`⚠️  Empresa não encontrada para artigo: ${artData.descricao}`);
      continue;
    }

    const exists = await artigoRepo.findOne({
      where: { 
        codigo: artData.codigo,
        empresaId: empresa.id 
      },
    });

    if (!exists) {
      const artigo = artigoRepo.create({
        ...artData,
        empresaId: empresa.id,
        ativo: true,
      });

      await artigoRepo.save(artigo);
      console.log(`✅ Artigo criado: ${artigo.descricao} (${artigo.codigo})`);
    } else {
      console.log(`⏭️  Artigo já existe: ${artData.descricao}`);
    }
  }
}

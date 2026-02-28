import { DataSource } from 'typeorm';
import { Entidade, TipoEntidade } from '../../modules/entidades/entities/entidade.entity';
import { Empresa } from '../../modules/empresas/entities/empresa.entity';

export async function seedEntidades(dataSource: DataSource): Promise<void> {
  const entidadeRepo = dataSource.getRepository(Entidade);
  const empresaRepo = dataSource.getRepository(Empresa);

  const empresas = await empresaRepo.find();

  if (empresas.length === 0) {
    console.log('⚠️  Nenhuma empresa encontrada.');
    return;
  }

  // Clientes da ABC Comercial
  const entidadesABC = [
    {
      nuit: '500111222',
      nome: 'Supermercado Popular, Lda',
      tipo: TipoEntidade.CLIENTE,
      cidade: 'Maputo',
      email: 'compras@superpop.co.mz',
      telefone: '+258 84 111 2222',
      limiteCredito: 200000,
      prazoPagamentoDias: 30,
      empresaNuit: '400123456',
    },
    {
      nuit: '500333444',
      nome: 'Construtora Nacional, SA',
      tipo: TipoEntidade.CLIENTE,
      cidade: 'Matola',
      email: 'contabilidade@cnacional.co.mz',
      telefone: '+258 82 333 4444',
      limiteCredito: 500000,
      prazoPagamentoDias: 45,
      empresaNuit: '400123456',
    },
  ];

  // Clientes da XYZ Importações
  const entidadesXYZ = [
    {
      nuit: '500555666',
      nome: 'Hotel Marítimo, Lda',
      tipo: TipoEntidade.CLIENTE,
      cidade: 'Beira',
      email: 'admin@hotelmaritimo.co.mz',
      telefone: '+258 23 123 456',
      limiteCredito: 300000,
      prazoPagamentoDias: 30,
      empresaNuit: '400654321',
    },
    {
      nuit: '600777888',
      nome: 'Fornecedores Industriais, Lda',
      tipo: TipoEntidade.FORNECEDOR,
      cidade: 'Nampula',
      email: 'vendas@findustriais.co.mz',
      telefone: '+258 26 789 012',
      limiteCredito: 0,
      prazoPagamentoDias: 30,
      empresaNuit: '400654321',
    },
  ];

  const todasEntidades = [...entidadesABC, ...entidadesXYZ];

  for (const entData of todasEntidades) {
    const exists = await entidadeRepo.findOne({
      where: { nuit: entData.nuit },
    });

    if (!exists) {
      const empresa = empresas.find(e => e.nuit === entData.empresaNuit);
      
      if (!empresa) {
        console.log(`⚠️  Empresa não encontrada para entidade: ${entData.nome}`);
        continue;
      }

      const entidade = entidadeRepo.create({
        ...entData,
        empresaId: empresa.id,
      });

      await entidadeRepo.save(entidade);
      console.log(`✅ Entidade criada: ${entidade.nome} (${entidade.tipo})`);
    } else {
      console.log(`⏭️  Entidade já existe: ${entData.nome}`);
    }
  }
}

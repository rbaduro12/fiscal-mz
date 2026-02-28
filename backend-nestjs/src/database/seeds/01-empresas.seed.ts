import { DataSource } from 'typeorm';
import { Empresa, RegimeIVA } from '../../modules/empresas/entities/empresa.entity';

export async function seedEmpresas(dataSource: DataSource): Promise<void> {
  const empresaRepo = dataSource.getRepository(Empresa);

  const empresas = [
    {
      nuit: '400123456',
      nomeFiscal: 'ABC Comercial, Lda',
      nomeComercial: 'ABC Comercial',
      regime: RegimeIVA.NORMAL,
      cidade: 'Maputo',
      email: 'geral@abc.co.mz',
      telefone: '+258 84 123 4567',
      limiteCreditoPadrao: 500000,
      prazoPagamentoDias: 30,
      ativo: true,
    },
    {
      nuit: '400654321',
      nomeFiscal: 'XYZ Importações, Lda',
      nomeComercial: 'XYZ Importações',
      regime: RegimeIVA.NORMAL,
      cidade: 'Beira',
      email: 'contato@xyz.co.mz',
      telefone: '+258 83 987 6543',
      limiteCreditoPadrao: 1000000,
      prazoPagamentoDias: 45,
      ativo: true,
    },
    {
      nuit: '400111222',
      nomeFiscal: 'Tech Solutions Moçambique, Lda',
      nomeComercial: 'TechSol MZ',
      regime: RegimeIVA.NORMAL,
      cidade: 'Nampula',
      email: 'info@techsol.co.mz',
      telefone: '+258 86 111 2222',
      limiteCreditoPadrao: 250000,
      prazoPagamentoDias: 15,
      ativo: true,
    },
  ];

  for (const empresaData of empresas) {
    const exists = await empresaRepo.findOne({
      where: { nuit: empresaData.nuit },
    });

    if (!exists) {
      const empresa = empresaRepo.create(empresaData);
      await empresaRepo.save(empresa);
      console.log(`✅ Empresa criada: ${empresa.nomeFiscal} (${empresa.nuit})`);
    } else {
      console.log(`⏭️  Empresa já existe: ${empresaData.nomeFiscal}`);
    }
  }
}

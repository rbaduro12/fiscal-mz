import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Utilizador, UserRole } from '../../modules/utilizadores/entities/utilizador.entity';
import { Empresa } from '../../modules/empresas/entities/empresa.entity';

export async function seedUtilizadores(dataSource: DataSource): Promise<void> {
  const userRepo = dataSource.getRepository(Utilizador);
  const empresaRepo = dataSource.getRepository(Empresa);

  // Buscar empresas
  const empresas = await empresaRepo.find();

  if (empresas.length === 0) {
    console.log('⚠️  Nenhuma empresa encontrada. Execute o seed de empresas primeiro.');
    return;
  }

  const utilizadores = [
    // Admin da ABC Comercial
    {
      email: 'admin@abc.co.mz',
      password: 'admin123',
      nome: 'Manuel Fernando',
      role: UserRole.ADMIN,
      empresaNuit: '400123456',
    },
    // Vendedor da ABC Comercial
    {
      email: 'vendedor@abc.co.mz',
      password: 'vendedor123',
      nome: 'Maria dos Santos',
      role: UserRole.VENDEDOR,
      empresaNuit: '400123456',
    },
    // Admin da XYZ Importações
    {
      email: 'admin@xyz.co.mz',
      password: 'admin123',
      nome: 'João Pereira',
      role: UserRole.ADMIN,
      empresaNuit: '400654321',
    },
    // Contabilista da XYZ Importações
    {
      email: 'contabilista@xyz.co.mz',
      password: 'conta123',
      nome: 'Ana Maria',
      role: UserRole.CONTABILISTA,
      empresaNuit: '400654321',
    },
  ];

  for (const userData of utilizadores) {
    const exists = await userRepo.findOne({
      where: { email: userData.email },
    });

    if (!exists) {
      const empresa = empresas.find(e => e.nuit === userData.empresaNuit);
      
      if (!empresa) {
        console.log(`⚠️  Empresa não encontrada para: ${userData.email}`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = userRepo.create({
        email: userData.email,
        passwordHash: hashedPassword,
        nome: userData.nome,
        role: userData.role,
        empresaId: empresa.id,
        ativo: true,
      });

      await userRepo.save(user);
      console.log(`✅ Utilizador criado: ${user.nome} (${user.email}) - ${user.role}`);
    } else {
      console.log(`⏭️  Utilizador já existe: ${userData.email}`);
    }
  }
}

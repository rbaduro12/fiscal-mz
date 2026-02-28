import { NestFactory } from '@nestjs/core'
import { Logger } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { DatabaseModule } from '../database.module'
import { UsersService } from '../../modules/users/users.service'
import { UserRole } from '../../modules/users/enums/user-role.enum'

async function bootstrap() {
  const logger = new Logger('Seed')
  
  const app = await NestFactory.createApplicationContext(DatabaseModule)
  const usersService = app.get(UsersService)

  try {
    logger.log('🌱 Iniciando seed...')

    // Hash password para todos
    const passwordHash = await bcrypt.hash('password123', 10)

    // ========== ADMIN ==========
    const admin = await usersService.create({
      email: 'admin@fiscal.mz',
      password: passwordHash,
      name: 'Administrador Geral',
      role: UserRole.ADMIN,
      nuit: '000000001',
      phone: '+258 84 000 0001',
      companyName: 'FISCAL.MZ Admin',
      isActive: true,
    })
    logger.log('✅ Admin criado: ' + admin.email)

    // ========== CLIENTE 1: ABC Comercial ==========
    const cliente1 = await usersService.create({
      email: 'abc@comercial.co.mz',
      password: passwordHash,
      name: 'Manuel Fernando',
      role: UserRole.CLIENT,
      nuit: '123456789',
      phone: '+258 84 123 4567',
      companyName: 'ABC Comercial, Lda',
      companyAddress: 'Av. Eduardo Mondlane, 1234, Maputo',
      isActive: true,
    })
    logger.log('✅ Cliente 1 criado: ' + cliente1.email)

    // ========== CLIENTE 2: XYZ Imports ==========
    const cliente2 = await usersService.create({
      email: 'xyz@imports.co.mz',
      password: passwordHash,
      name: 'Ana Maria Santos',
      role: UserRole.CLIENT,
      nuit: '987654321',
      phone: '+258 86 987 6543',
      companyName: 'XYZ Imports & Export',
      companyAddress: 'Rua da Industria, 567, Beira',
      isActive: true,
    })
    logger.log('✅ Cliente 2 criado: ' + cliente2.email)

    // ========== CLIENTE 3: Maputo Tech Solutions ==========
    const cliente3 = await usersService.create({
      email: 'geral@maputotech.co.mz',
      password: passwordHash,
      name: 'Carlos Domingos',
      role: UserRole.CLIENT,
      nuit: '456789123',
      phone: '+258 87 456 7890',
      companyName: 'Maputo Tech Solutions',
      companyAddress: 'Av. Julius Nyerere, 890, Maputo',
      isActive: true,
    })
    logger.log('✅ Cliente 3 criado: ' + cliente3.email)

    // ========== CLIENTE 4: Nampula Agro ==========
    const cliente4 = await usersService.create({
      email: 'info@nampulaagro.co.mz',
      password: passwordHash,
      name: 'Fatima Abdallah',
      role: UserRole.CLIENT,
      nuit: '789123456',
      phone: '+258 85 789 1234',
      companyName: 'Nampula Agro Negocios',
      companyAddress: 'Av. 25 de Setembro, 432, Nampula',
      isActive: true,
    })
    logger.log('✅ Cliente 4 criado: ' + cliente4.email)

    // ========== RESUMO ==========
    logger.log('\n📊 RESUMO DO SEED:')
    logger.log('==================')
    logger.log(`👤 Admin: admin@fiscal.mz (senha: password123)`)
    logger.log(`👥 Clientes: 4 criados`)
    logger.log(`   - ABC Comercial (abc@comercial.co.mz)`)
    logger.log(`   - XYZ Imports (xyz@imports.co.mz)`)
    logger.log(`   - Maputo Tech (geral@maputotech.co.mz)`)
    logger.log(`   - Nampula Agro (info@nampulaagro.co.mz)`)
    logger.log('==================')

  } catch (error) {
    logger.error('❌ Erro no seed:', error)
  } finally {
    await app.close()
  }
}

bootstrap()

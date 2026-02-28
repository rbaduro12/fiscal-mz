import { DataSource } from 'typeorm';
import { seedEmpresas } from './seeds/01-empresas.seed';
import { seedUtilizadores } from './seeds/02-utilizadores.seed';
import { seedEntidades } from './seeds/03-entidades.seed';
import { seedArtigos } from './seeds/04-artigos.seed';

async function runSeed() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  try {
    const dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5433'),
      username: process.env.DB_USERNAME || 'fiscal_admin',
      password: process.env.DB_PASSWORD || 'fiscal_secure_2025',
      database: process.env.DB_NAME || 'fiscal_mz_db',
      entities: ['src/modules/**/*.entity.ts'],
      synchronize: false,
    });

    await dataSource.initialize();
    console.log('✅ Conectado ao banco de dados\n');

    // Executar seeds em ordem
    await seedEmpresas(dataSource);
    console.log('');

    await seedUtilizadores(dataSource);
    console.log('');

    await seedEntidades(dataSource);
    console.log('');

    await seedArtigos(dataSource);
    console.log('');

    console.log('🎉 Seed concluído com sucesso!');
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    process.exit(1);
  }
}

runSeed();

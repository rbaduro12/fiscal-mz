import { Controller, Post } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { seedEmpresas } from '../../database/seeds/01-empresas.seed';
import { seedUtilizadores } from '../../database/seeds/02-utilizadores.seed';
import { seedEntidades } from '../../database/seeds/03-entidades.seed';
import { seedArtigos } from '../../database/seeds/04-artigos.seed';

@Controller('seed')
export class SeedController {
  constructor(private dataSource: DataSource) {}

  @Post('all')
  async seedAll() {
    try {
      await seedEmpresas(this.dataSource);
      await seedUtilizadores(this.dataSource);
      await seedEntidades(this.dataSource);
      await seedArtigos(this.dataSource);
      
      return { message: '✅ Seed concluído com sucesso!' };
    } catch (error) {
      return { message: '❌ Erro no seed', error: error.message };
    }
  }

  @Post('empresas')
  async seedEmpresas() {
    await seedEmpresas(this.dataSource);
    return { message: '✅ Empresas criadas!' };
  }

  @Post('utilizadores')
  async seedUtilizadores() {
    await seedUtilizadores(this.dataSource);
    return { message: '✅ Utilizadores criados!' };
  }

  @Post('entidades')
  async seedEntidades() {
    await seedEntidades(this.dataSource);
    return { message: '✅ Entidades criadas!' };
  }

  @Post('artigos')
  async seedArtigos() {
    await seedArtigos(this.dataSource);
    return { message: '✅ Artigos criados!' };
  }
}

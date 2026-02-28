import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Entidade } from './entities/entidade.entity';
import { EntidadesService } from './services/entidades.service';
import { EntidadesController } from './controllers/entidades.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Entidade])],
  providers: [EntidadesService],
  controllers: [EntidadesController],
  exports: [EntidadesService],
})
export class EntidadesModule {}

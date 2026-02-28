import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Artigo } from './entities/artigo.entity';
import { ArtigosService } from './services/artigos.service';
import { ArtigosController } from './controllers/artigos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Artigo])],
  providers: [ArtigosService],
  controllers: [ArtigosController],
  exports: [ArtigosService],
})
export class ArtigosModule {}

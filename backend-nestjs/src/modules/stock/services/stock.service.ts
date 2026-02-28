import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { MovimentoStock } from '../entities/movimento-stock.entity';
import { Artigo, TipoArtigo } from '../../artigos/entities/artigo.entity';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(MovimentoStock)
    private repo: Repository<MovimentoStock>,
    private dataSource: DataSource,
  ) {}

  async getMovimentos(artigoId: string): Promise<MovimentoStock[]> {
    return this.repo.find({
      where: { artigoId },
      order: { createdAt: 'DESC' },
      relations: ['artigo']
    });
  }

  async validarStockDisponivel(itens: any[], empresaId: string): Promise<any[]> {
    const semStock = [];
    
    for (const item of itens) {
      if (!item.artigoId) continue;

      const artigo = await this.dataSource.getRepository(Artigo).findOne({
        where: { id: item.artigoId, empresaId, tipo: TipoArtigo.PRODUTO }
      });

      if (!artigo) continue;

      if (artigo.stockAtual < item.quantidade) {
        semStock.push({
          artigoId: artigo.id,
          codigo: artigo.codigo,
          descricao: artigo.descricao,
          solicitado: item.quantidade,
          disponivel: artigo.stockAtual,
          falta: item.quantidade - artigo.stockAtual,
        });
      }
    }

    return semStock;
  }
}

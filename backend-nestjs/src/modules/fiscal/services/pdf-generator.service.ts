import { Injectable, Logger } from '@nestjs/common';
import * as PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/build/pdfmake';
import { DeclaracaoIVA } from '../entities/declaracao-iva.entity';
import { Empresa } from '../../empresas/entities/empresa.entity';

/**
 * Serviço de geração de PDF para documentos fiscais
 * Implementa layout oficial do Modelo A de IVA conforme especificações da AT
 */
@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name);
  private readonly printer: PdfPrinter;

  constructor() {
    // Configuração de fontes
    const fonts = {
      Roboto: {
        normal: Buffer.from(require('pdfmake/build/vfs_fonts.js').pdfMake.vfs['Roboto-Regular.ttf'], 'base64'),
        bold: Buffer.from(require('pdfmake/build/vfs_fonts.js').pdfMake.vfs['Roboto-Medium.ttf'], 'base64'),
        italics: Buffer.from(require('pdfmake/build/vfs_fonts.js').pdfMake.vfs['Roboto-Italic.ttf'], 'base64'),
        bolditalics: Buffer.from(require('pdfmake/build/vfs_fonts.js').pdfMake.vfs['Roboto-MediumItalic.ttf'], 'base64'),
      },
    };
    this.printer = new PdfPrinter(fonts);
  }

  /**
   * Gera PDF do Modelo A de IVA com layout oficial
   */
  async gerarPDFModeloA(
    declaracao: DeclaracaoIVA,
    empresa: Empresa,
  ): Promise<Buffer> {
    this.logger.log(`Gerando PDF Modelo A: ${declaracao.periodoMes}/${declaracao.periodoAno}`);

    const docDefinition = this.criarDefinicaoModeloA(declaracao, empresa);
    
    return this.gerarPDF(docDefinition);
  }

  /**
   * Cria a definição do documento PDF do Modelo A
   */
  private criarDefinicaoModeloA(
    declaracao: DeclaracaoIVA,
    empresa: Empresa,
  ): TDocumentDefinitions {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const ivaLiquidado = declaracao.q1TotalIva16;
    const ivaDedutivel = declaracao.q5ComprasBensIva16 + declaracao.q5ComprasServicosIva16 + declaracao.q5ImportacoesIva + declaracao.q5ComprasIva5;

    return {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      defaultStyle: {
        font: 'Roboto',
        fontSize: 9,
      },
      header: {
        stack: [
          {
            columns: [
              {
                width: '*',
                stack: [
                  { text: 'REPÚBLICA DE MOÇAMBIQUE', fontSize: 10, bold: true },
                  { text: 'AUTORIDADE TRIBUTÁRIA DE MOÇAMBIQUE', fontSize: 10 },
                  { text: 'Modelo A - Declaração de IVA', fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
                ],
              },
              {
                width: 'auto',
                table: {
                  widths: ['*'],
                  body: [
                    [{ text: `Período: ${meses[declaracao.periodoMes - 1]}/${declaracao.periodoAno}`, alignment: 'center', bold: true }],
                  ],
                },
              },
            ],
          },
          {
            margin: [0, 15, 0, 15],
            table: {
              widths: ['50%', '50%'],
              body: [
                [
                  { text: 'Dados do Contribuinte', bold: true, fillColor: '#1a365d', color: 'white', colSpan: 2 },
                  {},
                ],
                [
                  { text: `Nome: ${empresa.nomeFiscal}`, colSpan: 2 },
                  {},
                ],
                [
                  { text: `NUIT: ${empresa.nuit}` },
                  { text: `Regime: ${empresa.regime}` },
                ],
              ],
            },
          },
        ],
        margin: [40, 20, 40, 0],
      },
      content: [
        // Quadro 01
        {
          table: {
            headerRows: 1,
            widths: ['*', '30%', '30%'],
            body: [
              [{ text: 'QUADRO 01 - Operações Tributáveis à Taxa de 16%', bold: true, fillColor: '#1a365d', color: 'white', colSpan: 3 }, {}, {}],
              [
                { text: 'Descrição', bold: true, fillColor: '#e2e8f0' },
                { text: 'Valor Base (MZN)', bold: true, fillColor: '#e2e8f0', alignment: 'right' },
                { text: 'IVA (MZN)', bold: true, fillColor: '#e2e8f0', alignment: 'right' },
              ],
              [
                { text: 'Vendas de Bens' },
                { text: this.formatarValor(declaracao.q1VendasBens16), alignment: 'right' },
                { text: this.formatarValor(declaracao.q1VendasBensIva), alignment: 'right' },
              ],
              [
                { text: 'Prestação de Serviços' },
                { text: this.formatarValor(declaracao.q1VendasServicos16), alignment: 'right' },
                { text: this.formatarValor(declaracao.q1VendasServicosIva), alignment: 'right' },
              ],
              [
                { text: 'TOTAL QUADRO 01', bold: true, fillColor: '#f7fafc' },
                { text: this.formatarValor(declaracao.q1TotalBase16), bold: true, alignment: 'right', fillColor: '#f7fafc' },
                { text: this.formatarValor(declaracao.q1TotalIva16), bold: true, alignment: 'right', fillColor: '#f7fafc' },
              ],
            ],
          },
          margin: [0, 0, 0, 10],
        },

        // Quadro 02
        {
          table: {
            headerRows: 1,
            widths: ['*', '30%', '30%'],
            body: [
              [{ text: 'QUADRO 02 - Operações Tributáveis à Taxa de 10%', bold: true, fillColor: '#1a365d', color: 'white', colSpan: 3 }, {}, {}],
              [
                { text: 'Descrição', bold: true, fillColor: '#e2e8f0' },
                { text: 'Valor Base (MZN)', bold: true, fillColor: '#e2e8f0', alignment: 'right' },
                { text: 'IVA (MZN)', bold: true, fillColor: '#e2e8f0', alignment: 'right' },
              ],
              [
                { text: 'Vendas de Bens' },
                { text: this.formatarValor(declaracao.q2Bens10), alignment: 'right' },
                { text: this.formatarValor(declaracao.q2BensIva10), alignment: 'right' },
              ],
              [
                { text: 'Prestação de Serviços' },
                { text: this.formatarValor(declaracao.q2Servicos10), alignment: 'right' },
                { text: this.formatarValor(declaracao.q2ServicosIva10), alignment: 'right' },
              ],
            ],
          },
          margin: [0, 0, 0, 10],
        },

        // Quadro 05
        {
          table: {
            headerRows: 1,
            widths: ['*', '30%', '30%'],
            body: [
              [{ text: 'QUADRO 05 - Compras e Serviços Externos (IVA Dedutível)', bold: true, fillColor: '#1a365d', color: 'white', colSpan: 3 }, {}, {}],
              [
                { text: 'Descrição', bold: true, fillColor: '#e2e8f0' },
                { text: 'Valor Base (MZN)', bold: true, fillColor: '#e2e8f0', alignment: 'right' },
                { text: 'IVA (MZN)', bold: true, fillColor: '#e2e8f0', alignment: 'right' },
              ],
              [
                { text: 'Compras de Bens à Taxa de 16%' },
                { text: this.formatarValor(declaracao.q5ComprasBens16), alignment: 'right' },
                { text: this.formatarValor(declaracao.q5ComprasBensIva16), alignment: 'right' },
              ],
              [
                { text: 'Prestação de Serviços à Taxa de 16%' },
                { text: this.formatarValor(declaracao.q5ComprasServicos16), alignment: 'right' },
                { text: this.formatarValor(declaracao.q5ComprasServicosIva16), alignment: 'right' },
              ],
              [
                { text: 'Importações' },
                { text: this.formatarValor(declaracao.q5ImportacoesBens), alignment: 'right' },
                { text: this.formatarValor(declaracao.q5ImportacoesIva), alignment: 'right' },
              ],
            ],
          },
          margin: [0, 0, 0, 10],
        },

        // Quadro 06
        {
          table: {
            headerRows: 1,
            widths: ['70%', '30%'],
            body: [
              [{ text: 'QUADRO 06 - Apuramento do IVA', bold: true, fillColor: '#1a365d', color: 'white', colSpan: 2 }, {}],
              [
                { text: 'IVA Liquidado (Quadro 01)' },
                { text: this.formatarValor(ivaLiquidado), alignment: 'right' },
              ],
              [
                { text: 'IVA Dedutível (Quadro 05)' },
                { text: this.formatarValor(ivaDedutivel), alignment: 'right' },
              ],
              [
                { text: 'Diferença (Liquidado - Dedutível)', bold: true },
                { text: this.formatarValor(declaracao.q6Diferenca), bold: true, alignment: 'right' },
              ],
              [
                { text: 'Crédito do Período Anterior' },
                { text: this.formatarValor(declaracao.q6CreditoPeriodoAnterior), alignment: 'right' },
              ],
              [
                { text: 'IVA a Pagar', bold: true, color: '#c53030' },
                { text: this.formatarValor(declaracao.q6IvaAPagar), bold: true, alignment: 'right', color: '#c53030' },
              ],
              [
                { text: 'Crédito a Transportar', color: '#22543d' },
                { text: this.formatarValor(declaracao.q6CreditoTransportar), alignment: 'right', color: '#22543d' },
              ],
            ],
          },
          margin: [0, 0, 0, 10],
        },

        // Rodapé
        {
          margin: [0, 20, 0, 0],
          fillColor: '#ebf8ff',
          padding: [10, 10, 10, 10],
          table: {
            widths: ['*'],
            body: [
              [
                {
                  text: [
                    { text: 'Informações de Validação\n\n', bold: true },
                    { text: `Código de Validação: ${declaracao.numeroConfirmacaoAT || 'Pendente'}\n` },
                    { text: `Data de Submissão: ${declaracao.dataSubmissao ? new Date(declaracao.dataSubmissao).toLocaleString('pt-MZ') : 'Não submetida'}\n` },
                    { text: `Estado: ${declaracao.estado}` },
                  ],
                },
              ],
            ],
          },
        },
        {
          margin: [0, 20, 0, 0],
          text: 'Documento gerado automaticamente pelo sistema FISCAL.MZ 2.0',
          alignment: 'center',
          fontSize: 8,
          color: '#718096',
          italics: true,
        },
      ],
      footer: (currentPage: number, pageCount: number) => ({
        text: `Página ${currentPage} de ${pageCount}`,
        alignment: 'center',
        fontSize: 8,
        color: '#666',
        margin: [0, 20, 0, 0],
      }),
    };
  }

  /**
   * Gera o PDF a partir da definição do documento
   */
  private async gerarPDF(docDefinition: TDocumentDefinitions): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const pdfDoc = this.printer.createPdfKitDocument(docDefinition);
        const chunks: Buffer[] = [];

        pdfDoc.on('data', (chunk) => chunks.push(chunk));
        pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
        pdfDoc.on('error', (error) => reject(error));

        pdfDoc.end();
      } catch (error) {
        this.logger.error('Erro ao gerar PDF:', error);
        reject(error);
      }
    });
  }

  /**
   * Formata valor monetário para exibição
   */
  private formatarValor(valor: number | null | undefined): string {
    if (valor === null || valor === undefined) return '0,00';
    return valor.toLocaleString('pt-MZ', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}

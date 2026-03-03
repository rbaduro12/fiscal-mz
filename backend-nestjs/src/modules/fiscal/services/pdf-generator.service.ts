import { Injectable, Logger } from '@nestjs/common';
import { DeclaracaoIVA } from '../entities/declaracao-iva.entity';
import { Empresa } from '../../empresas/entities/empresa.entity';

/**
 * Serviço de geração de PDF para documentos fiscais
 * Implementa layout oficial do Modelo A de IVA conforme especificações da AT
 */
@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name);

  constructor() {
    this.logger.log('PdfGeneratorService inicializado');
  }

  /**
   * Gera PDF do Modelo A de IVA com layout oficial
   * Versão simplificada - retorna HTML para conversão posterior
   */
  async gerarPDFModeloA(declaracao: DeclaracaoIVA, empresa: Empresa): Promise<Buffer> {
    this.logger.log(`Gerando PDF para declaração ${declaracao.id}`);
    
    // Por enquanto, retornamos um HTML simples como placeholder
    // Em produção, usaríamos pdfmake ou puppeteer
    const html = this.gerarHTMLModeloA(declaracao, empresa);
    return Buffer.from(html, 'utf-8');
  }

  /**
   * Gera conteúdo HTML do Modelo A
   */
  private gerarHTMLModeloA(declaracao: DeclaracaoIVA, empresa: Empresa): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Modelo A - Declaração de IVA</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { font-size: 18px; margin: 0; }
    .header h2 { font-size: 14px; margin: 5px 0; }
    .info { margin-bottom: 20px; }
    .info table { width: 100%; border-collapse: collapse; }
    .info td { padding: 5px; border: 1px solid #ccc; }
    .quadros { margin-top: 20px; }
    .quadros table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .quadros th, .quadros td { padding: 8px; border: 1px solid #333; text-align: left; }
    .quadros th { background-color: #f0f0f0; }
    .signature { margin-top: 50px; text-align: center; }
    .signature-line { border-top: 1px solid #000; width: 300px; margin: 50px auto 10px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>MODELO A - DECLARAÇÃO DE IVA</h1>
    <h2>Período: ${declaracao.periodoMes}/${declaracao.periodoAno}</h2>
  </div>
  
  <div class="info">
    <table>
      <tr>
        <td><strong>NUIT:</strong> ${empresa.nuit}</td>
        <td><strong>Nome Fiscal:</strong> ${empresa.nomeFiscal}</td>
      </tr>
    </table>
  </div>
  
  <div class="quadros">
    <h3>QUADRO 01 - Vendas 16%</h3>
    <table>
      <tr>
        <th>Descrição</th>
        <th>Valor (MZN)</th>
      </tr>
      <tr>
        <td>Vendas de Bens</td>
        <td>${declaracao.q1VendasBens16?.toFixed(2) || '0.00'}</td>
      </tr>
      <tr>
        <td>Vendas de Serviços</td>
        <td>${declaracao.q1VendasServicos16?.toFixed(2) || '0.00'}</td>
      </tr>
      <tr>
        <td><strong>Total Base de IVA</strong></td>
        <td><strong>${declaracao.q1TotalBase16?.toFixed(2) || '0.00'}</strong></td>
      </tr>
      <tr>
        <td><strong>Total IVA 16%</strong></td>
        <td><strong>${declaracao.q1TotalIva16?.toFixed(2) || '0.00'}</strong></td>
      </tr>
    </table>
    
    <h3>QUADRO 06 - Apuramento</h3>
    <table>
      <tr>
        <th>Descrição</th>
        <th>Valor (MZN)</th>
      </tr>
      <tr>
        <td>IVA Liquidado</td>
        <td>${declaracao.q6IvaLiquidado?.toFixed(2) || '0.00'}</td>
      </tr>
      <tr>
        <td>IVA Dedutível</td>
        <td>${declaracao.q6IvaDedutivel?.toFixed(2) || '0.00'}</td>
      </tr>
      <tr>
        <td><strong>IVA a Pagar</strong></td>
        <td><strong>${declaracao.q6IvaAPagar?.toFixed(2) || '0.00'}</strong></td>
      </tr>
    </table>
  </div>
  
  <div class="signature">
    <div class="signature-line"></div>
    <p>Assinatura do Contribuinte</p>
    <p>Data: ${new Date().toLocaleDateString('pt-MZ')}</p>
  </div>
</body>
</html>`;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

interface EmailData {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
  }>;
}

/**
 * Serviço de envio de email transacional
 * Suporta templates e anexos
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly mailerService: MailerService) {}

  /**
   * Envia email genérico
   */
  async sendEmail(data: EmailData): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: data.to,
        subject: data.subject,
        text: data.text,
        html: data.html,
        attachments: data.attachments,
      });

      this.logger.log(`Email enviado para: ${data.to}`);
    } catch (error) {
      this.logger.error(`Erro ao enviar email: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Notifica novo documento recebido
   */
  async notificarNovoDocumento(
    email: string,
    nomeEmpresa: string,
    tipoDocumento: string,
    numeroDocumento: string,
    valor: number,
    link: string,
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a365d;">Novo Documento Recebido</h2>
        <p>Olá,</p>
        <p>Você recebeu um novo documento de <strong>${nomeEmpresa}</strong>:</p>
        
        <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Tipo:</strong> ${tipoDocumento}</p>
          <p><strong>Número:</strong> ${numeroDocumento}</p>
          <p><strong>Valor:</strong> MZN ${valor.toLocaleString('pt-MZ')}</p>
        </div>
        
        <a href="${link}" style="display: inline-block; background: #5E6AD2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Ver Documento
        </a>
        
        <p style="color: #718096; font-size: 12px; margin-top: 30px;">
          Este é um email automático do sistema FISCAL.MZ
        </p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: `Novo ${tipoDocumento} - ${numeroDocumento}`,
      html,
    });
  }

  /**
   * Notifica pagamento recebido
   */
  async notificarPagamentoRecebido(
    email: string,
    nomeCliente: string,
    numeroDocumento: string,
    valor: number,
    metodo: string,
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #22543d;">✓ Pagamento Confirmado</h2>
        <p>Olá,</p>
        <p>Recebemos o pagamento de <strong>${nomeCliente}</strong>:</p>
        
        <div style="background: #f0fff4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Documento:</strong> ${numeroDocumento}</p>
          <p><strong>Valor:</strong> MZN ${valor.toLocaleString('pt-MZ')}</p>
          <p><strong>Método:</strong> ${metodo}</p>
          <p><strong>Status:</strong> Pago ✓</p>
        </div>
        
        <p style="color: #718096; font-size: 12px; margin-top: 30px;">
          Este é um email automático do sistema FISCAL.MZ
        </p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: `Pagamento Confirmado - ${numeroDocumento}`,
      html,
    });
  }

  /**
   * Alerta de stock baixo
   */
  async alertaStockBaixo(
    email: string,
    nomeArtigo: string,
    codigoArtigo: string,
    stockAtual: number,
    stockMinimo: number,
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #c53030;">⚠ Alerta de Stock Baixo</h2>
        <p>O seguinte artigo está com stock baixo:</p>
        
        <div style="background: #fff5f5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #c53030;">
          <p><strong>Artigo:</strong> ${nomeArtigo}</p>
          <p><strong>Código:</strong> ${codigoArtigo}</p>
          <p><strong>Stock Atual:</strong> ${stockAtual}</p>
          <p><strong>Stock Mínimo:</strong> ${stockMinimo}</p>
        </div>
        
        <p>Por favor, repõe o stock o mais breve possível.</p>
        
        <p style="color: #718096; font-size: 12px; margin-top: 30px;">
          Este é um email automático do sistema FISCAL.MZ
        </p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: `Alerta: Stock Baixo - ${codigoArtigo}`,
      html,
    });
  }

  /**
   * Lembrete de vencimento
   */
  async lembreteVencimento(
    email: string,
    numeroDocumento: string,
    valor: number,
    dataVencimento: Date,
    diasRestantes: number,
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #c05621;">⏰ Lembrete de Vencimento</h2>
        <p>O seguinte documento vence em breve:</p>
        
        <div style="background: #fffaf0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #c05621;">
          <p><strong>Documento:</strong> ${numeroDocumento}</p>
          <p><strong>Valor:</strong> MZN ${valor.toLocaleString('pt-MZ')}</p>
          <p><strong>Vencimento:</strong> ${dataVencimento.toLocaleDateString('pt-MZ')}</p>
          <p><strong>Dias restantes:</strong> ${diasRestantes}</p>
        </div>
        
        <p>Por favor, efetue o pagamento para evitar atrasos.</p>
        
        <p style="color: #718096; font-size: 12px; margin-top: 30px;">
          Este é um email automático do sistema FISCAL.MZ
        </p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: `Lembrete: Vencimento em ${diasRestantes} dias - ${numeroDocumento}`,
      html,
    });
  }
}

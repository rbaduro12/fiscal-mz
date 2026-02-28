import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notificacao } from '../entities/notificacao.entity';

/**
 * WebSocket Gateway para notificações em tempo real
 * Permite comunicação B2B instantânea entre empresas
 */
@WebSocketGateway({
  namespace: 'notificacoes',
  cors: {
    origin: '*',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class NotificacoesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificacoesGateway.name);
  private readonly userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Notificacao)
    private readonly notificacaoRepo: Repository<Notificacao>,
  ) {}

  /**
   * Handler de conexão - autentica o utilizador via JWT
   */
  async handleConnection(client: Socket) {
    try {
      this.logger.log(`Cliente tentando conectar: ${client.id}`);

      // Extrair token do handshake
      const token = client.handshake.auth.token || client.handshake.query.token as string;

      if (!token) {
        this.logger.warn(`Conexão rejeitada - Token não fornecido: ${client.id}`);
        client.disconnect();
        return;
      }

      // Verificar token JWT
      const payload = this.jwtService.verify(token);
      const userId = payload.sub;
      const empresaId = payload.empresaId;

      // Armazenar dados do utilizador no socket
      client.data.userId = userId;
      client.data.empresaId = empresaId;
      client.data.email = payload.email;

      // Mapear socket ao utilizador
      this.userSockets.set(userId, client.id);

      // Entrar na sala da empresa (para notificações da empresa)
      client.join(`empresa:${empresaId}`);

      this.logger.log(`✅ Cliente conectado: ${client.id} | User: ${userId} | Empresa: ${empresaId}`);

      // Enviar notificações não lidas
      await this.enviarNotificacoesNaoLidas(client, empresaId);

      // Notificar outros sockets do mesmo utilizador
      this.notificarConexao(client, userId);

    } catch (error) {
      this.logger.error(`Erro na conexão: ${error.message}`, error.stack);
      client.disconnect();
    }
  }

  /**
   * Handler de desconexão
   */
  handleDisconnect(client: Socket) {
    const userId = client.data?.userId;
    
    if (userId && this.userSockets.get(userId) === client.id) {
      this.userSockets.delete(userId);
      this.logger.log(`❌ Cliente desconectado: ${client.id} | User: ${userId}`);
    }
  }

  /**
   * Envia notificações não lidas para o utilizador recém-conectado
   */
  private async enviarNotificacoesNaoLidas(client: Socket, empresaId: string) {
    try {
      const notificacoes = await this.notificacaoRepo.find({
        where: { 
          empresaDestinatarioId: empresaId,
          lida: false,
        },
        order: { createdAt: 'DESC' },
        take: 20,
      });

      if (notificacoes.length > 0) {
        client.emit('notificacoes:nao-lidas', {
          count: notificacoes.length,
          notificacoes: notificacoes.map(n => this.formatarNotificacao(n)),
        });
      }
    } catch (error) {
      this.logger.error('Erro ao buscar notificações não lidas:', error);
    }
  }

  /**
   * Notifica outros dispositivos do mesmo utilizador sobre nova conexão
   */
  private notificarConexao(client: Socket, userId: string) {
    // Envia para outros sockets do mesmo user (multi-device)
    client.to(`user:${userId}`).emit('sessao:nova-conexao', {
      socketId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Cliente confirma leitura de notificação
   */
  @SubscribeMessage('notificacao:marcar-lida')
  async marcarComoLida(
    @MessageBody() data: { notificacaoId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { notificacaoId } = data;
      const empresaId = client.data.empresaId;

      const notificacao = await this.notificacaoRepo.findOne({
        where: { id: notificacaoId, empresaDestinatarioId: empresaId },
      });

      if (notificacao) {
        notificacao.lida = true;
        notificacao.dataLeitura = new Date();
        await this.notificacaoRepo.save(notificacao);

        this.logger.debug(`Notificação ${notificacaoId} marcada como lida`);

        // Atualizar contador de não lidas
        await this.atualizarContadorNaoLidas(empresaId);

        return { success: true };
      }

      return { success: false, error: 'Notificação não encontrada' };
    } catch (error) {
      this.logger.error('Erro ao marcar notificação como lida:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cliente pede todas as notificações
   */
  @SubscribeMessage('notificacoes:listar')
  async listarNotificacoes(
    @MessageBody() data: { limite?: number; apenasNaoLidas?: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const empresaId = client.data.empresaId;
      const { limite = 50, apenasNaoLidas = false } = data;

      const where: any = { empresaDestinatarioId: empresaId };
      if (apenasNaoLidas) {
        where.lida = false;
      }

      const notificacoes = await this.notificacaoRepo.find({
        where,
        order: { createdAt: 'DESC' },
        take: limite,
      });

      return {
        success: true,
        data: notificacoes.map(n => this.formatarNotificacao(n)),
      };
    } catch (error) {
      this.logger.error('Erro ao listar notificações:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cliente marca todas como lidas
   */
  @SubscribeMessage('notificacoes:marcar-todas-lidas')
  async marcarTodasComoLidas(
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const empresaId = client.data.empresaId;

      await this.notificacaoRepo.update(
        { empresaDestinatarioId: empresaId, lida: false },
        { lida: true, dataLeitura: new Date() },
      );

      // Atualizar contador
      await this.atualizarContadorNaoLidas(empresaId);

      this.logger.log(`Todas as notificações marcadas como lidas para empresa ${empresaId}`);

      return { success: true };
    } catch (error) {
      this.logger.error('Erro ao marcar todas como lidas:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envia notificação para uma empresa específica
   * Método público para ser usado por outros serviços
   */
  async enviarNotificacaoParaEmpresa(empresaId: string, notificacao: Partial<Notificacao>) {
    try {
      // Persistir no banco
      const novaNotificacao = this.notificacaoRepo.create({
        ...notificacao,
        empresaDestinatarioId: empresaId,
        lida: false,
        createdAt: new Date(),
      });

      const salva = await this.notificacaoRepo.save(novaNotificacao);

      // Enviar via WebSocket
      this.server.to(`empresa:${empresaId}`).emit('notificacao:nova', {
        notificacao: this.formatarNotificacao(salva),
      });

      // Atualizar contador
      this.atualizarContadorNaoLidas(empresaId);

      this.logger.debug(`Notificação enviada para empresa ${empresaId}`);

      return salva;
    } catch (error) {
      this.logger.error('Erro ao enviar notificação:', error);
      throw error;
    }
  }

  /**
   * Envia notificação para um utilizador específico
   */
  async enviarNotificacaoParaUsuario(userId: string, notificacao: Partial<Notificacao>) {
    const socketId = this.userSockets.get(userId);
    
    if (socketId) {
      this.server.to(socketId).emit('notificacao:nova', {
        notificacao: this.formatarNotificacao(notificacao as Notificacao),
      });
    }
  }

  /**
   * Atualiza o contador de notificações não lidas
   */
  private async atualizarContadorNaoLidas(empresaId: string) {
    try {
      const count = await this.notificacaoRepo.count({
        where: { empresaDestinatarioId: empresaId, lida: false },
      });

      this.server.to(`empresa:${empresaId}`).emit('notificacoes:contador', { count });
    } catch (error) {
      this.logger.error('Erro ao atualizar contador:', error);
    }
  }

  /**
   * Formata notificação para envio
   */
  private formatarNotificacao(notificacao: Notificacao) {
    return {
      id: notificacao.id,
      tipo: notificacao.tipo,
      titulo: notificacao.titulo,
      mensagem: notificacao.mensagem,
      lida: notificacao.lida,
      acaoUrl: notificacao.acaoUrl,
      acaoTexto: notificacao.acaoTexto,
      createdAt: notificacao.createdAt,
    };
  }

  /**
   * Broadcast para todas as empresas (avisos do sistema)
   */
  async broadcastSistema(titulo: string, mensagem: string, tipo: string = 'SISTEMA') {
    this.server.emit('notificacao:sistema', {
      titulo,
      mensagem,
      tipo,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * FISCAL.MZ 2.0 - NegotiationCard Component
 * B2B Workflow - Linear-inspired Design
 * 
 * Exibe uma cotação/negociação com timeline visual de estados
 */

import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Send, 
  CheckCircle2, 
  Clock, 
  FileText, 
  AlertCircle,
  MessageSquare,
  TrendingDown,
  XCircle,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ============================================================================
   TYPES
   ============================================================================ */

type CotacaoStatus = 
  | 'RASCUNHO' 
  | 'ENVIADA' 
  | 'NEGOCIANDO' 
  | 'ACEITE' 
  | 'REJEITADA' 
  | 'CONVERTIDA' 
  | 'VENCIDA';

interface HistoricoItem {
  id: string;
  data: string;
  autor: string;
  autorTipo: 'VENDEDOR' | 'COMPRADOR';
  tipo: 'ALTERACAO_PRECO' | 'ALTERACAO_QTD' | 'COUNTER_OFFER' | 'COMENTARIO' | 'ENVIO' | 'ACEITE' | 'REJEITE';
  campoAfectado?: string;
  valorAnterior?: number;
  valorNovo?: number;
  comentario?: string;
}

interface ItemCotacao {
  produtoId: string;
  descricao: string;
  quantidade: number;
  precoUnit: number;
  descontoPercent: number;
  ivaPercent: number;
  totalLinha: number;
}

interface NegotiationCardProps {
  id: string;
  numeroCotacao: string;
  status: CotacaoStatus;
  clienteNome: string;
  clienteAvatar?: string;
  dataCriacao: string;
  validadeAte: string;
  totalEstimado: number;
  moeda?: string;
  itens: ItemCotacao[];
  historico: HistoricoItem[];
  proformaGerada?: {
    numero: string;
    status: 'PENDENTE' | 'PAGA' | 'VENCIDA';
  };
  onVerProforma?: () => void;
  onEnviar?: () => void;
  onAceitar?: () => void;
  onRejeitar?: () => void;
  onCounterOffer?: () => void;
  isLoading?: boolean;
}

/* ============================================================================
   CONFIGURAÇÃO DE ESTADOS
   ============================================================================ */

const STATUS_CONFIG: Record<CotacaoStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  dotColor: string;
  glow?: boolean;
}> = {
  RASCUNHO: {
    label: 'Rascunho',
    color: 'text-foreground-muted',
    bgColor: 'bg-background-tertiary',
    icon: <FileText className="w-4 h-4" />,
    dotColor: 'bg-foreground-muted',
  },
  ENVIADA: {
    label: 'Enviada',
    color: 'text-info',
    bgColor: 'bg-info-dim',
    icon: <Send className="w-4 h-4" />,
    dotColor: 'bg-info',
    glow: true,
  },
  NEGOCIANDO: {
    label: 'Em Negociação',
    color: 'text-warning',
    bgColor: 'bg-warning-dim',
    icon: <MessageSquare className="w-4 h-4" />,
    dotColor: 'bg-warning',
    glow: true,
  },
  ACEITE: {
    label: 'Aceite',
    color: 'text-success',
    bgColor: 'bg-success-dim',
    icon: <CheckCircle2 className="w-4 h-4" />,
    dotColor: 'bg-success',
  },
  CONVERTIDA: {
    label: 'Convertida',
    color: 'text-accent',
    bgColor: 'bg-accent/15',
    icon: <FileText className="w-4 h-4" />,
    dotColor: 'bg-accent',
  },
  REJEITADA: {
    label: 'Rejeitada',
    color: 'text-error',
    bgColor: 'bg-error-dim',
    icon: <XCircle className="w-4 h-4" />,
    dotColor: 'bg-error',
  },
  VENCIDA: {
    label: 'Vencida',
    color: 'text-foreground-muted',
    bgColor: 'bg-background-tertiary',
    icon: <Clock className="w-4 h-4" />,
    dotColor: 'bg-foreground-muted',
  },
};

const HISTORICO_ICONS: Record<HistoricoItem['tipo'], React.ReactNode> = {
  ALTERACAO_PRECO: <TrendingDown className="w-3.5 h-3.5" />,
  ALTERACAO_QTD: <FileText className="w-3.5 h-3.5" />,
  COUNTER_OFFER: <MessageSquare className="w-3.5 h-3.5" />,
  COMENTARIO: <MessageSquare className="w-3.5 h-3.5" />,
  ENVIO: <Send className="w-3.5 h-3.5" />,
  ACEITE: <CheckCircle2 className="w-3.5 h-3.5" />,
  REJEITE: <XCircle className="w-3.5 h-3.5" />,
};

/* ============================================================================
   COMPONENTE PRINCIPAL
   ============================================================================ */

export const NegotiationCard: React.FC<NegotiationCardProps> = ({
  numeroCotacao,
  status,
  clienteNome,
  clienteAvatar,
  dataCriacao,
  validadeAte,
  totalEstimado,
  moeda = 'MZN',
  itens,
  historico,
  proformaGerada,
  onVerProforma,
  onEnviar,
  onAceitar,
  onRejeitar,
  onCounterOffer,
  isLoading,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  
  const config = STATUS_CONFIG[status];
  const diasRestantes = Math.ceil((new Date(validadeAte).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isVencida = diasRestantes < 0;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: moeda,
    }).format(value);
  };
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-MZ', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="group relative"
    >
      {/* Card Principal */}
      <div 
        className={`
          relative overflow-hidden rounded-lg border border-border bg-background-secondary
          transition-all duration-300 ease-in-out
          hover:border-border-hover hover:-translate-y-0.5 hover:shadow-card-hover
          ${isExpanded ? 'ring-1 ring-accent/30' : ''}
        `}
      >
        {/* Glow effect para estados ativos */}
        {config.glow && (
          <div className={`
            absolute top-0 left-0 w-full h-0.5 
            ${status === 'ENVIADA' ? 'bg-info' : 'bg-warning'}
            opacity-60
          `} />
        )}
        
        {/* Header */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            {/* Left: Status dot + Info */}
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {/* Status Dot com Timeline connector */}
              <div className="relative flex flex-col items-center pt-1">
                <motion.div
                  animate={status === 'ENVIADA' || status === 'NEGOCIANDO' ? {
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.7, 1],
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className={`
                    w-3 h-3 rounded-full ${config.dotColor}
                    ${status === 'ENVIADA' || status === 'NEGOCIANDO' ? 'ring-2 ring-offset-2 ring-offset-background-secondary ring-current' : ''}
                  `}
                />
                {/* Vertical line para timeline visual */}
                <div className="w-px h-full bg-border mt-2 opacity-30" />
              </div>
              
              {/* Info principal */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-caption text-foreground-muted font-mono">
                    {numeroCotacao}
                  </span>
                  <span className="text-foreground-muted">•</span>
                  <span className="text-caption text-foreground-muted">
                    {formatDate(dataCriacao)}
                  </span>
                </div>
                
                <h3 className="text-title text-foreground-primary truncate mb-1">
                  {clienteNome}
                </h3>
                
                <div className="flex items-center gap-3">
                  {/* Status Badge */}
                  <span className={`
                    inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-caption font-medium
                    ${config.color} ${config.bgColor}
                  `}>
                    {config.icon}
                    {config.label}
                  </span>
                  
                  {/* Badge Proforma */}
                  {proformaGerada && (
                    <button
                      onClick={onVerProforma}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-caption font-medium text-accent bg-accent/15 hover:bg-accent/25 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {proformaGerada.numero}
                    </button>
                  )}
                  
                  {/* Badge Vencimento */}
                  {!isVencida && status !== 'CONVERTIDA' && status !== 'REJEITADA' && (
                    <span className={`
                      text-caption ${diasRestantes <= 3 ? 'text-warning' : 'text-foreground-muted'}
                    `}>
                      {diasRestantes === 0 ? 'Vence hoje' : `${diasRestantes}d restantes`}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right: Valor + Actions */}
            <div className="flex flex-col items-end gap-3">
              <div className="text-right">
                <p className="text-display text-foreground-primary">
                  {formatCurrency(totalEstimado)}
                </p>
                <p className="text-caption text-foreground-muted">
                  {itens.length} {itens.length === 1 ? 'item' : 'itens'}
                </p>
              </div>
              
              {/* Quick Actions baseado no status */}
              <div className="flex items-center gap-2">
                {status === 'RASCUNHO' && (
                  <button
                    onClick={onEnviar}
                    disabled={isLoading}
                    className="
                      px-4 py-2 rounded-md text-body font-medium
                      bg-accent text-white
                      hover:bg-accent-hover active:bg-accent-active active:scale-[0.98]
                      transition-all duration-fast disabled:opacity-50 disabled:cursor-not-allowed
                      flex items-center gap-2
                    "
                  >
                    <Send className="w-4 h-4" />
                    Enviar
                  </button>
                )}
                
                {status === 'ENVIADA' && (
                  <>
                    <button
                      onClick={onRejeitar}
                      disabled={isLoading}
                      className="px-3 py-2 rounded-md text-body text-foreground-secondary hover:text-error hover:bg-error-dim transition-colors"
                    >
                      Rejeitar
                    </button>
                    <button
                      onClick={onCounterOffer}
                      disabled={isLoading}
                      className="px-3 py-2 rounded-md text-body text-foreground-secondary hover:text-foreground-primary hover:bg-background-tertiary transition-colors"
                    >
                      Contra-proposta
                    </button>
                    <button
                      onClick={onAceitar}
                      disabled={isLoading}
                      className="px-4 py-2 rounded-md text-body font-medium bg-success text-white hover:bg-success/90 active:scale-[0.98] transition-all"
                    >
                      Aceitar
                    </button>
                  </>
                )}
                
                {status === 'NEGOCIANDO' && (
                  <button
                    onClick={onCounterOffer}
                    disabled={isLoading}
                    className="px-4 py-2 rounded-md text-body font-medium bg-accent text-white hover:bg-accent-hover transition-colors"
                  >
                    Responder
                  </button>
                )}
                
                {status === 'VENCIDA' && (
                  <button
                    className="px-3 py-2 rounded-md text-body text-foreground-secondary hover:text-foreground-primary hover:bg-background-tertiary transition-colors flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Renovar
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Toggle Timeline */}
          {historico.length > 0 && (
            <button
              onClick={() => setShowTimeline(!showTimeline)}
              className="mt-4 flex items-center gap-2 text-caption text-foreground-secondary hover:text-foreground-primary transition-colors"
            >
              {showTimeline ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showTimeline ? 'Ocultar histórico' : `Ver histórico (${historico.length})`}
            </button>
          )}
        </div>
        
        {/* Timeline de Negociação (Expandable) */}
        <AnimatePresence>
          {showTimeline && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden border-t border-border"
            >
              <div className="p-5 pt-4">
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border" />
                  
                  {/* Timeline items */}
                  <div className="space-y-4">
                    {historico.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative pl-6"
                      >
                        {/* Dot */}
                        <div className={`
                          absolute left-0 top-1 w-2.5 h-2.5 rounded-full border-2 border-background-secondary
                          ${item.autorTipo === 'VENDEDOR' ? 'bg-accent' : 'bg-warning'}
                        `} />
                        
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-caption text-foreground-primary font-medium">
                                {item.autor}
                              </span>
                              <span className="text-small text-foreground-muted">
                                {formatDate(item.data)}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-body text-foreground-secondary">
                              {HISTORICO_ICONS[item.tipo]}
                              <span>
                                {item.tipo === 'ALTERACAO_PRECO' && (
                                  <>Preço alterado: {formatCurrency(item.valorAnterior || 0)} → {formatCurrency(item.valorNovo || 0)}</>
                                )}
                                {item.tipo === 'COUNTER_OFFER' && 'Enviou contra-proposta'}
                                {item.tipo === 'COMENTARIO' && item.comentario}
                                {item.tipo === 'ENVIO' && 'Cotação enviada'}
                                {item.tipo === 'ACEITE' && 'Cotação aceite'}
                                {item.tipo === 'REJEITE' && 'Cotação rejeitada'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Preview de Itens (Expandable) */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden border-t border-border"
            >
              <div className="p-5">
                <h4 className="text-caption text-foreground-muted uppercase tracking-wide mb-3">
                  Itens da Cotação
                </h4>
                <div className="space-y-2">
                  {itens.map((item) => (
                    <div 
                      key={item.produtoId}
                      className="flex items-center justify-between py-2 px-3 rounded-md bg-background-tertiary"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-body text-foreground-primary truncate">
                          {item.descricao}
                        </p>
                        <p className="text-caption text-foreground-muted">
                          {item.quantidade} × {formatCurrency(item.precoUnit)}
                          {item.descontoPercent > 0 && (
                            <span className="text-success ml-2">(-{item.descontoPercent}%)</span>
                          )}
                        </p>
                      </div>
                      <p className="text-body font-medium text-foreground-primary font-mono">
                        {formatCurrency(item.totalLinha)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Footer com toggle expand */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-2 flex items-center justify-center gap-2 text-caption text-foreground-secondary hover:text-foreground-primary hover:bg-background-tertiary transition-colors border-t border-border"
        >
          {isExpanded ? (
            <><ChevronUp className="w-4 h-4" /> Menos detalhes</>
          ) : (
            <><ChevronDown className="w-4 h-4" /> Ver itens</>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default NegotiationCard;

/**
 * FISCAL.MZ 2.0 - FiscalBadge Component
 * Document Status - Linear-inspired Design
 * 
 * Badge de status fiscal com animações e validação visual
 */

import React from 'react';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  CloudUpload, 
  XCircle,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  QrCode,
  FileCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

/* ============================================================================
   TYPES
   ============================================================================ */

type FiscalStatus = 
  | 'VALIDO'           // Documento fiscalmente válido
  | 'PENDENTE_SYNC'    // Aguardando sincronização
  | 'SYNCING'          // Em sincronização
  | 'ERRO_HASH'        // Erro de integridade
  | 'ERRO_VALIDACAO'   // Erro de validação fiscal
  | 'ANULADO'          // Documento anulado
  | 'NAO_AUTORIZADO'   // Não autorizado pela AGT
  | 'VALIDADO_RECENTE'; // Acabou de ser validado (animação especial)

type BadgeSize = 'sm' | 'md' | 'lg';
type BadgeVariant = 'pill' | 'card' | 'minimal';

interface FiscalBadgeProps {
  status: FiscalStatus;
  size?: BadgeSize;
  variant?: BadgeVariant;
  showQrCode?: boolean;
  hash?: string;
  dataValidacao?: string;
  mensagemErro?: string;
  onRetry?: () => void;
  onViewDetails?: () => void;
  className?: string;
  animate?: boolean;
}

interface StatusConfig {
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  iconBg: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  glowColor?: string;
  animate?: boolean;
  description: string;
}

/* ============================================================================
   CONFIGURAÇÃO DOS ESTADOS
   ============================================================================ */

const STATUS_CONFIG: Record<FiscalStatus, StatusConfig> = {
  VALIDO: {
    label: 'Fiscalmente Válido',
    shortLabel: 'Válido',
    icon: <ShieldCheck className="w-full h-full" />,
    iconBg: 'bg-success/15',
    textColor: 'text-success',
    bgColor: 'bg-success-dim',
    borderColor: 'border-success/30',
    glowColor: 'shadow-glow-success',
    description: 'Documento validado e em conformidade',
  },
  VALIDADO_RECENTE: {
    label: 'Validado',
    shortLabel: 'Validado',
    icon: <ShieldCheck className="w-full h-full" />,
    iconBg: 'bg-success/15',
    textColor: 'text-success',
    bgColor: 'bg-success-dim',
    borderColor: 'border-success/30',
    glowColor: 'shadow-glow-success',
    animate: true,
    description: 'Documento acabou de ser validado',
  },
  PENDENTE_SYNC: {
    label: 'Pendente Sincronização',
    shortLabel: 'Pendente',
    icon: <CloudUpload className="w-full h-full" />,
    iconBg: 'bg-warning/15',
    textColor: 'text-warning',
    bgColor: 'bg-warning-dim',
    borderColor: 'border-warning/30',
    description: 'Aguardando envio para AGT',
  },
  SYNCING: {
    label: 'Sincronizando...',
    shortLabel: 'Sincronizando',
    icon: <RefreshCw className="w-full h-full" />,
    iconBg: 'bg-info/15',
    textColor: 'text-info',
    bgColor: 'bg-info-dim',
    borderColor: 'border-info/30',
    animate: true,
    description: 'Enviando para validação',
  },
  ERRO_HASH: {
    label: 'Erro de Integridade',
    shortLabel: 'Erro Hash',
    icon: <ShieldAlert className="w-full h-full" />,
    iconBg: 'bg-error/15',
    textColor: 'text-error',
    bgColor: 'bg-error-dim',
    borderColor: 'border-error/30',
    glowColor: 'shadow-glow-error',
    description: 'Hash do documento não corresponde',
  },
  ERRO_VALIDACAO: {
    label: 'Erro de Validação',
    shortLabel: 'Inválido',
    icon: <XCircle className="w-full h-full" />,
    iconBg: 'bg-error/15',
    textColor: 'text-error',
    bgColor: 'bg-error-dim',
    borderColor: 'border-error/30',
    glowColor: 'shadow-glow-error',
    description: 'Documento rejeitado pela AGT',
  },
  ANULADO: {
    label: 'Documento Anulado',
    shortLabel: 'Anulado',
    icon: <AlertTriangle className="w-full h-full" />,
    iconBg: 'bg-foreground-muted/15',
    textColor: 'text-foreground-muted',
    bgColor: 'bg-background-tertiary',
    borderColor: 'border-border',
    description: 'Documento foi anulado',
  },
  NAO_AUTORIZADO: {
    label: 'Não Autorizado',
    shortLabel: 'Não Autorizado',
    icon: <Shield className="w-full h-full" />,
    iconBg: 'bg-error/15',
    textColor: 'text-error',
    bgColor: 'bg-error-dim',
    borderColor: 'border-error/30',
    description: 'Sem autorização da AGT',
  },
};

/* ============================================================================
   UTILIDADES
   ============================================================================ */

const truncateHash = (hash: string, length: number = 12): string => {
  if (hash.length <= length * 2) return hash;
  return `${hash.substring(0, length)}...${hash.substring(hash.length - length)}`;
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('pt-MZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/* ============================================================================
   COMPONENTES AUXILIARES
   ============================================================================ */

const IconWrapper: React.FC<{
  children: React.ReactNode;
  size: BadgeSize;
  animate?: boolean;
  className?: string;
}> = ({ children, size, animate, className }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };
  
  return (
    <div className={`
      ${sizeClasses[size]} ${className}
      ${animate ? 'animate-pulse' : ''}
    `}>
      {children}
    </div>
  );
};

/* ============================================================================
   COMPONENTE PRINCIPAL
   ============================================================================ */

export const FiscalBadge: React.FC<FiscalBadgeProps> = ({
  status,
  size = 'md',
  variant = 'pill',
  showQrCode = false,
  hash,
  dataValidacao,
  mensagemErro,
  onRetry,
  onViewDetails,
  className = '',
  animate = true,
}) => {
  const config = STATUS_CONFIG[status];
  
  // Size configurations
  const sizeConfig = {
    sm: {
      padding: 'px-2 py-0.5',
      text: 'text-small',
      icon: 'w-3.5 h-3.5',
      gap: 'gap-1',
    },
    md: {
      padding: 'px-2.5 py-1',
      text: 'text-caption',
      icon: 'w-4 h-4',
      gap: 'gap-1.5',
    },
    lg: {
      padding: 'px-3 py-1.5',
      text: 'text-body',
      icon: 'w-5 h-5',
      gap: 'gap-2',
    },
  };
  
  const { padding, text, icon: iconSize, gap } = sizeConfig[size];
  
  // Render variants
  if (variant === 'minimal') {
    return (
      <motion.div
        initial={animate ? { opacity: 0, scale: 0.9 } : false}
        animate={{ opacity: 1, scale: 1 }}
        className={`
          inline-flex items-center ${gap} ${padding} rounded-full
          ${config.bgColor} ${config.textColor}
          ${className}
        `}
        title={config.description}
      >
        <IconWrapper size={size} animate={config.animate} className={config.textColor}>
          {config.icon}
        </IconWrapper>
        <span className={`${text} font-medium whitespace-nowrap`}>
          {config.shortLabel}
        </span>
      </motion.div>
    );
  }
  
  if (variant === 'pill') {
    return (
      <motion.div
        initial={animate ? { opacity: 0, y: -5 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`
          inline-flex items-center ${gap} ${padding} rounded-full
          ${config.bgColor} ${config.borderColor} border
          ${config.glowColor || ''}
          ${className}
        `}
      >
        <div className={`
          ${size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-6 h-6' : 'w-7 h-7'}
          rounded-full ${config.iconBg} flex items-center justify-center
          flex-shrink-0
        `}>
          <IconWrapper 
            size={size} 
            animate={config.animate}
            className={config.textColor}
          >
            {config.icon}
          </IconWrapper>
        </div>
        
        <div className="flex flex-col">
          <span className={`${text} font-medium ${config.textColor}`}>
            {config.label}
          </span>
          {dataValidacao && (
            <span className="text-small text-foreground-muted">
              {formatDate(dataValidacao)}
            </span>
          )}
        </div>
        
        {/* Retry button for error states */}
        {(status === 'ERRO_HASH' || status === 'ERRO_VALIDACAO') && onRetry && (
          <button
            onClick={onRetry}
            className="ml-2 p-1 rounded hover:bg-background-tertiary transition-colors"
            title="Tentar novamente"
          >
            <RefreshCw className={`w-4 h-4 ${config.textColor}`} />
          </button>
        )}
      </motion.div>
    );
  }
  
  // Card variant (full detailed view)
  return (
    <motion.div
      initial={animate ? { opacity: 0, scale: 0.95 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
      className={`
        relative overflow-hidden rounded-xl border ${config.borderColor} ${config.bgColor}
        ${config.glowColor || ''}
        ${className}
      `}
    >
      {/* Glow animation for VALIDADO_RECENTE */}
      {status === 'VALIDADO_RECENTE' && (
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-success/10"
        />
      )}
      
      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className={`
            w-12 h-12 rounded-xl ${config.iconBg} flex items-center justify-center flex-shrink-0
            ${config.animate ? 'animate-pulse' : ''}
          `}>
            <IconWrapper size="lg" className={config.textColor}>
              {config.icon}
            </IconWrapper>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className={`text-title font-semibold ${config.textColor}`}>
              {config.label}
            </h3>
            <p className="text-body text-foreground-secondary mt-0.5">
              {config.description}
            </p>
          </div>
        </div>
        
        {/* Hash display */}
        {hash && (
          <div className="mt-4 p-3 rounded-lg bg-background-primary/50 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <FileCheck className="w-4 h-4 text-foreground-muted" />
              <span className="text-caption text-foreground-muted uppercase tracking-wide">
                Hash SHA-256
              </span>
            </div>
            <p className="text-caption font-mono text-foreground-secondary break-all">
              {truncateHash(hash, 16)}
            </p>
          </div>
        )}
        
        {/* Error message */}
        {mensagemErro && (
          <div className="mt-4 p-3 rounded-lg bg-error/10 border border-error/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
              <p className="text-body text-error">
                {mensagemErro}
              </p>
            </div>
          </div>
        )}
        
        {/* QR Code placeholder */}
        {showQrCode && status === 'VALIDO' && (
          <div className="mt-4 flex items-center gap-4 p-4 rounded-lg bg-background-primary border border-border">
            <div className="w-20 h-20 rounded-lg bg-white flex items-center justify-center">
              <QrCode className="w-12 h-12 text-background-primary" />
            </div>
            <div>
              <p className="text-body text-foreground-primary font-medium">
                QR Code Fiscal
              </p>
              <p className="text-caption text-foreground-muted">
                Escaneie para validar o documento
              </p>
            </div>
          </div>
        )}
        
        {/* Validation timestamp */}
        {dataValidacao && (
          <div className="mt-4 flex items-center gap-2 text-caption text-foreground-muted">
            <CheckCircle2 className="w-4 h-4" />
            <span>Validado em {formatDate(dataValidacao)}</span>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="mt-5 flex gap-3">
          {(status === 'ERRO_HASH' || status === 'ERRO_VALIDACAO') && onRetry && (
            <button
              onClick={onRetry}
              className="
                flex-1 py-2.5 px-4 rounded-lg
                bg-error text-white text-body font-medium
                hover:bg-error/90 active:scale-[0.98]
                transition-all duration-fast
                flex items-center justify-center gap-2
              "
            >
              <RefreshCw className="w-4 h-4" />
              Tentar novamente
            </button>
          )}
          
          {status === 'PENDENTE_SYNC' && (
            <button
              disabled
              className="
                flex-1 py-2.5 px-4 rounded-lg
                bg-background-tertiary text-foreground-muted text-body
                flex items-center justify-center gap-2
              "
            >
              <RefreshCw className="w-4 h-4 animate-spin" />
              Aguardando...
            </button>
          )}
          
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="
                py-2.5 px-4 rounded-lg
                bg-background-tertiary text-foreground-primary text-body font-medium
                hover:bg-background-elevated
                transition-colors
              "
            >
              Ver detalhes
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* ============================================================================
   COMPONENTES ESPECIALIZADOS
   ============================================================================ */

/**
 * FiscalStatusRow - Versão em linha para tabelas
 */
export const FiscalStatusRow: React.FC<Omit<FiscalBadgeProps, 'variant'>> = (props) => {
  return <FiscalBadge {...props} variant="minimal" size="sm" />;
};

/**
 * FiscalValidationAnimation - Animação completa de validação
 */
export const FiscalValidationAnimation: React.FC<{
  onComplete?: () => void;
}> = ({ onComplete }) => {
  const [step, setStep] = useState<'syncing' | 'validating' | 'success'>('syncing');
  
  React.useEffect(() => {
    const timer1 = setTimeout(() => setStep('validating'), 1500);
    const timer2 = setTimeout(() => {
      setStep('success');
      onComplete?.();
    }, 3000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);
  
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        key={step}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="flex flex-col items-center"
      >
        {step === 'syncing' && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            >
              <CloudUpload className="w-16 h-16 text-info" />
            </motion.div>
            <p className="mt-4 text-body text-foreground-secondary">Sincronizando...</p>
          </>
        )}
        
        {step === 'validating' && (
          <>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              <Shield className="w-16 h-16 text-accent" />
            </motion.div>
            <p className="mt-4 text-body text-foreground-secondary">Validando...</p>
          </>
        )}
        
        {step === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <ShieldCheck className="w-16 h-16 text-success" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-headline text-success font-semibold"
            >
              Validado!
            </motion.p>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default FiscalBadge;

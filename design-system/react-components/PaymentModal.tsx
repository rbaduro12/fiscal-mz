/**
 * FISCAL.MZ 2.0 - PaymentModal Component
 * Payment Orchestration - Linear-inspired Design
 * 
 * Modal wizard para processamento de pagamentos
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Loader2, 
  Shield, 
  Smartphone,
  CreditCard,
  Banknote,
  Wallet,
  Lock,
  AlertCircle,
  Clock,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ============================================================================
   TYPES
   ============================================================================ */

type MetodoPagamento = 'MPESA' | 'EMOLA' | 'BIM' | 'CARTAO_DEBITO' | 'CARTAO_CREDITO' | 'CASH' | 'ESCROW';
type PaymentStep = 'METODO' | 'RESUMO' | 'PROCESSANDO' | 'SUCESSO' | 'ERRO';
type PaymentState = 'PENDENTE' | 'PROCESSANDO' | 'CONCLUIDO' | 'FALHADO';

interface ProformaResumo {
  numero: string;
  dataEmissao: string;
  totalGeral: number;
  condicoesPagamento: 'IMMEDIATO' | '30_DIAS' | '50_50' | 'ESCROW';
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  proforma: ProformaResumo;
  clienteNome: string;
  tenantNome: string;
  moeda?: string;
  onProcessPayment: (metodo: MetodoPagamento, dados?: any) => Promise<{ success: boolean; error?: string }>;
  onEscrowConfirm?: () => void;
}

interface MetodoConfig {
  id: MetodoPagamento;
  label: string;
  descricao: string;
  icon: React.ReactNode;
  color: string;
  disponivel: boolean;
  tempoProcessamento?: string;
}

/* ============================================================================
   CONFIGURAÇÃO DOS MÉTODOS DE PAGAMENTO
   ============================================================================ */

const METODOS_PAGAMENTO: MetodoConfig[] = [
  {
    id: 'MPESA',
    label: 'M-Pesa',
    descricao: 'Pagamento via M-Pesa',
    icon: <Smartphone className="w-6 h-6" />,
    color: 'from-red-500 to-red-600',
    disponivel: true,
    tempoProcessamento: 'Instantâneo',
  },
  {
    id: 'EMOLA',
    label: 'EMola',
    descricao: 'Pagamento via EMola',
    icon: <Smartphone className="w-6 h-6" />,
    color: 'from-orange-500 to-orange-600',
    disponivel: true,
    tempoProcessamento: 'Instantâneo',
  },
  {
    id: 'BIM',
    label: 'BIM',
    descricao: 'Pagamento via BIM',
    icon: <Smartphone className="w-6 h-6" />,
    color: 'from-blue-500 to-blue-600',
    disponivel: true,
    tempoProcessamento: 'Instantâneo',
  },
  {
    id: 'CARTAO_DEBITO',
    label: 'Cartão Débito',
    descricao: 'Visa, Mastercard',
    icon: <CreditCard className="w-6 h-6" />,
    color: 'from-purple-500 to-purple-600',
    disponivel: true,
    tempoProcessamento: 'Instantâneo',
  },
  {
    id: 'CARTAO_CREDITO',
    label: 'Cartão Crédito',
    descricao: 'Visa, Mastercard',
    icon: <CreditCard className="w-6 h-6" />,
    color: 'from-indigo-500 to-indigo-600',
    disponivel: true,
    tempoProcessamento: 'Instantâneo',
  },
  {
    id: 'CASH',
    label: 'Dinheiro',
    descricao: 'Pagamento em mãos',
    icon: <Banknote className="w-6 h-6" />,
    color: 'from-green-500 to-green-600',
    disponivel: true,
    tempoProcessamento: 'Na entrega',
  },
  {
    id: 'ESCROW',
    label: 'Garantia (Escrow)',
    descricao: 'Pagamento protegido',
    icon: <Shield className="w-6 h-6" />,
    color: 'from-accent to-accent-secondary',
    disponivel: true,
    tempoProcessamento: 'Após confirmação',
  },
];

/* ============================================================================
   COMPONENTE PRINCIPAL
   ============================================================================ */

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  proforma,
  clienteNome,
  tenantNome,
  moeda = 'MZN',
  onProcessPayment,
  onEscrowConfirm,
}) => {
  const [step, setStep] = useState<PaymentStep>('METODO');
  const [metodoSelecionado, setMetodoSelecionado] = useState<MetodoPagamento | null>(null);
  const [paymentState, setPaymentState] = useState<PaymentState>('PENDENTE');
  const [errorMessage, setErrorMessage] = useState('');
  const [telefone, setTelefone] = useState('');
  const [blurContent, setBlurContent] = useState(false);
  
  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('METODO');
      setMetodoSelecionado(null);
      setPaymentState('PENDENTE');
      setErrorMessage('');
      setTelefone('');
      setBlurContent(false);
    }
  }, [isOpen]);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: moeda,
    }).format(value);
  };
  
  const handleMetodoSelect = (metodo: MetodoPagamento) => {
    setMetodoSelecionado(metodo);
    setStep('RESUMO');
  };
  
  const handleProcessPayment = async () => {
    if (!metodoSelecionado) return;
    
    setStep('PROCESSANDO');
    setPaymentState('PROCESSANDO');
    
    try {
      const result = await onProcessPayment(metodoSelecionado, { telefone });
      
      if (result.success) {
        setPaymentState('CONCLUIDO');
        setTimeout(() => setStep('SUCESSO'), 500);
      } else {
        setPaymentState('FALHADO');
        setErrorMessage(result.error || 'Erro ao processar pagamento');
        setTimeout(() => setStep('ERRO'), 500);
      }
    } catch (error) {
      setPaymentState('FALHADO');
      setErrorMessage('Erro inesperado. Tente novamente.');
      setTimeout(() => setStep('ERRO'), 500);
    }
  };
  
  const handleClose = () => {
    if (step === 'PROCESSANDO') return; // Não permite fechar durante processamento
    onClose();
  };
  
  const handleBack = () => {
    if (step === 'RESUMO') {
      setStep('METODO');
      setMetodoSelecionado(null);
    }
  };
  
  const metodoConfig = metodoSelecionado ? METODOS_PAGAMENTO.find(m => m.id === metodoSelecionado) : null;
  
  // Bloquear/desbloquear blur baseado no input de dados sensíveis
  const handleTelefoneFocus = () => setBlurContent(true);
  const handleTelefoneBlur = () => setBlurContent(false);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop com blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-background-overlay backdrop-blur-sm"
            onClick={handleClose}
          />
          
          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            className={`
              relative w-full max-w-lg max-h-[90vh] overflow-hidden
              rounded-2xl bg-background-secondary border border-border shadow-xl
              ${blurContent ? 'blur-content' : ''}
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                {step !== 'METODO' && step !== 'SUCESSO' && step !== 'ERRO' && (
                  <button
                    onClick={handleBack}
                    className="p-1.5 rounded-md text-foreground-secondary hover:text-foreground-primary hover:bg-background-tertiary transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                <div>
                  <h2 className="text-headline text-foreground-primary">
                    {step === 'METODO' && 'Método de Pagamento'}
                    {step === 'RESUMO' && 'Confirmar Pagamento'}
                    {step === 'PROCESSANDO' && 'Processando...'}
                    {step === 'SUCESSO' && 'Pagamento Concluído'}
                    {step === 'ERRO' && 'Erro no Pagamento'}
                  </h2>
                  <p className="text-caption text-foreground-muted">
                    {proforma.numero} • {formatCurrency(proforma.totalGeral)}
                  </p>
                </div>
              </div>
              
              {step !== 'PROCESSANDO' && (
                <button
                  onClick={handleClose}
                  className="p-2 rounded-lg text-foreground-secondary hover:text-foreground-primary hover:bg-background-tertiary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
              <AnimatePresence mode="wait">
                {/* STEP 1: SELEÇÃO DO MÉTODO */}
                {step === 'METODO' && (
                  <motion.div
                    key="metodo"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="p-6"
                  >
                    <div className="grid grid-cols-1 gap-3">
                      {METODOS_PAGAMENTO.filter(m => m.disponivel).map((metodo) => (
                        <button
                          key={metodo.id}
                          onClick={() => handleMetodoSelect(metodo.id)}
                          className="
                            group relative flex items-center gap-4 p-4 rounded-xl
                            bg-background-tertiary border border-border
                            hover:border-accent/50 hover:bg-background-elevated
                            transition-all duration-fast
                            text-left
                          "
                        >
                          {/* Icon com gradient */}
                          <div className={`
                            w-12 h-12 rounded-xl flex items-center justify-center
                            bg-gradient-to-br ${metodo.color} text-white shadow-lg
                            group-hover:scale-105 transition-transform duration-fast
                          `}>
                            {metodo.icon}
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="text-title text-foreground-primary">
                              {metodo.label}
                            </h3>
                            <p className="text-body text-foreground-secondary">
                              {metodo.descricao}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <ChevronRight className="w-5 h-5 text-foreground-muted group-hover:text-accent transition-colors" />
                            {metodo.tempoProcessamento && (
                              <p className="text-caption text-foreground-muted mt-1">
                                {metodo.tempoProcessamento}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    {/* Info de segurança */}
                    <div className="mt-6 flex items-center justify-center gap-2 text-caption text-foreground-muted">
                      <Lock className="w-4 h-4" />
                      <span>Pagamento seguro e encriptado</span>
                    </div>
                  </motion.div>
                )}
                
                {/* STEP 2: RESUMO */}
                {step === 'RESUMO' && metodoConfig && (
                  <motion.div
                    key="resumo"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="p-6"
                  >
                    {/* Card flutuante da proforma */}
                    <div className="mb-6 p-5 rounded-xl bg-background-tertiary border border-border">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-accent" />
                          </div>
                          <div>
                            <p className="text-body text-foreground-primary font-medium">
                              {proforma.numero}
                            </p>
                            <p className="text-caption text-foreground-muted">
                              Emitida em {new Date(proforma.dataEmissao).toLocaleDateString('pt-MZ')}
                            </p>
                          </div>
                        </div>
                        <span className="text-display text-foreground-primary font-mono">
                          {formatCurrency(proforma.totalGeral)}
                        </span>
                      </div>
                      
                      <div className="space-y-2 pt-4 border-t border-border">
                        <div className="flex justify-between text-body">
                          <span className="text-foreground-secondary">De</span>
                          <span className="text-foreground-primary">{tenantNome}</span>
                        </div>
                        <div className="flex justify-between text-body">
                          <span className="text-foreground-secondary">Para</span>
                          <span className="text-foreground-primary">{clienteNome}</span>
                        </div>
                        <div className="flex justify-between text-body">
                          <span className="text-foreground-secondary">Condição</span>
                          <span className="text-foreground-primary">
                            {proforma.condicoesPagamento === 'IMMEDIATO' && 'Imediato'}
                            {proforma.condicoesPagamento === '30_DIAS' && '30 Dias'}
                            {proforma.condicoesPagamento === '50_50' && '50% / 50%'}
                            {proforma.condicoesPagamento === 'ESCROW' && 'Garantia'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Método selecionado */}
                    <div className="mb-6 p-4 rounded-lg bg-background-tertiary/50 border border-border flex items-center gap-3">
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center
                        bg-gradient-to-br ${metodoConfig.color} text-white
                      `}>
                        {metodoConfig.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-body text-foreground-primary font-medium">
                          {metodoConfig.label}
                        </p>
                        <p className="text-caption text-foreground-muted">
                          {metodoConfig.tempoProcessamento}
                        </p>
                      </div>
                      <button
                        onClick={() => setStep('METODO')}
                        className="text-caption text-accent hover:underline"
                      >
                        Alterar
                      </button>
                    </div>
                    
                    {/* Input de telefone para mobile payments */}
                    {(metodoSelecionado === 'MPESA' || metodoSelecionado === 'EMOLA' || metodoSelecionado === 'BIM') && (
                      <div className="mb-6">
                        <label className="block text-caption text-foreground-secondary mb-2">
                          Número de telefone
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            value={telefone}
                            onChange={(e) => setTelefone(e.target.value)}
                            onFocus={handleTelefoneFocus}
                            onBlur={handleTelefoneBlur}
                            placeholder="+258 84 000 0000"
                            className="
                              w-full px-4 py-3 rounded-lg
                              bg-background-tertiary border border-border
                              text-foreground-primary placeholder-foreground-muted
                              focus:border-accent focus:shadow-input-focus focus:outline-none
                              transition-all duration-fast font-mono
                            "
                          />
                          <Smartphone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                        </div>
                      </div>
                    )}
                    
                    {/* Warning para ESCROW */}
                    {metodoSelecionado === 'ESCROW' && (
                      <div className="mb-6 p-4 rounded-lg bg-warning-dim border border-warning/30">
                        <div className="flex items-start gap-3">
                          <Shield className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-body text-foreground-primary font-medium">
                              Pagamento em Garantia
                            </p>
                            <p className="text-caption text-foreground-secondary mt-1">
                              O valor será retido até a confirmação de entrega. 
                              O vendedor só receberá após você confirmar o recebimento.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Botão de pagar */}
                    <button
                      onClick={handleProcessPayment}
                      disabled={!telefone && (metodoSelecionado === 'MPESA' || metodoSelecionado === 'EMOLA' || metodoSelecionado === 'BIM')}
                      className="
                        w-full py-4 rounded-xl
                        bg-accent text-white text-title font-semibold
                        hover:bg-accent-hover active:scale-[0.98]
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
                        transition-all duration-fast
                        flex items-center justify-center gap-2
                      "
                    >
                      <Wallet className="w-5 h-5" />
                      Pagar {formatCurrency(proforma.totalGeral)}
                    </button>
                  </motion.div>
                )}
                
                {/* STEP 3: PROCESSANDO */}
                {step === 'PROCESSANDO' && (
                  <motion.div
                    key="processando"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-12 flex flex-col items-center justify-center text-center"
                  >
                    <div className="relative mb-6">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="w-20 h-20"
                      >
                        <Loader2 className="w-20 h-20 text-accent" />
                      </motion.div>
                      
                      {/* Pulse rings */}
                      <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-full bg-accent/20"
                      />
                    </div>
                    
                    <h3 className="text-headline text-foreground-primary mb-2">
                      Processando pagamento
                    </h3>
                    <p className="text-body text-foreground-secondary max-w-xs">
                      Por favor, aguarde enquanto processamos seu pagamento de {formatCurrency(proforma.totalGeral)}
                    </p>
                    
                    {/* Progress steps */}
                    <div className="mt-8 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                      <div className="w-2 h-2 rounded-full bg-accent/60 animate-pulse delay-75" />
                      <div className="w-2 h-2 rounded-full bg-accent/30 animate-pulse delay-150" />
                    </div>
                  </motion.div>
                )}
                
                {/* STEP 4: SUCESSO */}
                {step === 'SUCESSO' && (
                  <motion.div
                    key="sucesso"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                    className="p-12 flex flex-col items-center justify-center text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                      className="w-24 h-24 rounded-full bg-success-dim flex items-center justify-center mb-6"
                    >
                      <motion.div
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                      >
                        <CheckCircle2 className="w-12 h-12 text-success" />
                      </motion.div>
                    </motion.div>
                    
                    <h3 className="text-headline text-foreground-primary mb-2">
                      Pagamento confirmado!
                    </h3>
                    <p className="text-body text-foreground-secondary max-w-xs mb-6">
                      Seu pagamento de {formatCurrency(proforma.totalGeral)} foi processado com sucesso.
                    </p>
                    
                    <div className="p-4 rounded-xl bg-background-tertiary border border-border w-full max-w-xs mb-6">
                      <div className="flex items-center justify-between text-body mb-2">
                        <span className="text-foreground-secondary">Referência</span>
                        <span className="text-foreground-primary font-mono">{proforma.numero}</span>
                      </div>
                      <div className="flex items-center justify-between text-body">
                        <span className="text-foreground-secondary">Data</span>
                        <span className="text-foreground-primary">
                          {new Date().toLocaleDateString('pt-MZ')}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={onClose}
                      className="
                        px-8 py-3 rounded-xl
                        bg-success text-white text-body font-semibold
                        hover:bg-success/90 active:scale-[0.98]
                        transition-all duration-fast
                        shadow-glow-success
                      "
                    >
                      Concluir
                    </button>
                  </motion.div>
                )}
                
                {/* STEP 5: ERRO */}
                {step === 'ERRO' && (
                  <motion.div
                    key="erro"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="p-12 flex flex-col items-center justify-center text-center"
                  >
                    <div className="w-24 h-24 rounded-full bg-error-dim flex items-center justify-center mb-6">
                      <AlertCircle className="w-12 h-12 text-error" />
                    </div>
                    
                    <h3 className="text-headline text-foreground-primary mb-2">
                      Erro no pagamento
                    </h3>
                    <p className="text-body text-foreground-secondary max-w-xs mb-2">
                      {errorMessage}
                    </p>
                    <p className="text-caption text-foreground-muted">
                      Verifique seus dados e tente novamente.
                    </p>
                    
                    <div className="flex gap-3 mt-8">
                      <button
                        onClick={() => setStep('RESUMO')}
                        className="
                          px-6 py-3 rounded-xl
                          bg-background-tertiary text-foreground-primary text-body font-medium
                          hover:bg-background-elevated transition-colors
                        "
                      >
                        Voltar
                      </button>
                      <button
                        onClick={handleProcessPayment}
                        className="
                          px-6 py-3 rounded-xl
                          bg-accent text-white text-body font-medium
                          hover:bg-accent-hover active:scale-[0.98]
                          transition-all duration-fast
                        "
                      >
                        Tentar novamente
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Footer com progress */}
            {step === 'METODO' || step === 'RESUMO' ? (
              <div className="px-6 py-4 border-t border-border bg-background-tertiary/30">
                <div className="flex items-center justify-between">
                  <span className="text-caption text-foreground-muted">
                    Passo {step === 'METODO' ? '1' : '2'} de 2
                  </span>
                  <div className="flex gap-1">
                    <div className={`w-8 h-1 rounded-full ${step === 'METODO' ? 'bg-accent' : 'bg-accent/30'}`} />
                    <div className={`w-8 h-1 rounded-full ${step === 'RESUMO' ? 'bg-accent' : 'bg-border'}`} />
                  </div>
                </div>
              </div>
            ) : null}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;

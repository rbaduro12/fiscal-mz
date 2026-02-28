import { createFileRoute, Link } from '@tanstack/react-router'
import { FileText, AlertTriangle, CheckCircle, Clock, Download, RefreshCw, Loader2, Calculator, TrendingUp, TrendingDown } from 'lucide-react'
import { FiscalCard } from '@/components/ui/fiscal-card'
import { useState } from 'react'
import { useDeclaracoesIVA, useGerarModeloA, useFiscalManager } from '@/hooks/use-fiscal'
import { useFaturas } from '@/hooks/use-documentos'

export const Route = createFileRoute('/fiscal')({
  component: FiscalPage,
})

function FiscalPage() {
  const [ano, setAno] = useState(new Date().getFullYear())
  const [mes, setMes] = useState(new Date().getMonth() + 1)
  const { data: declaracoes, isLoading } = useDeclaracoesIVA({ ano, limit: 12 })
  const { data: faturas } = useFaturas({ limit: 5 })
  const gerarMutation = useGerarModeloA()
  
  // Declaração do período selecionado
  const declaracaoAtual = declaracoes?.items?.find((d: any) => d.periodoMes === mes && d.periodoAno === ano)

  const handleGerarModeloA = async () => {
    try {
      await gerarMutation.mutateAsync({ ano, mes })
      alert('Modelo A gerado com sucesso!')
    } catch (error: any) {
      alert('Erro ao gerar Modelo A: ' + error.message)
    }
  }

  const meses = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-boho-coffee">Fiscal & IVA</h1>
        <p className="text-boho-brown mt-1">Gestão fiscal e declarações de IVA (Modelo A)</p>
      </div>

      {/* Filtros de Período */}
      <FiscalCard className="mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-boho-brown">Mês:</label>
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="px-4 py-2 bg-boho-cream border border-boho-beige rounded-lg text-boho-coffee focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
            >
              {meses.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-boho-brown">Ano:</label>
            <select
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              className="px-4 py-2 bg-boho-cream border border-boho-beige rounded-lg text-boho-coffee focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
            >
              {[2024, 2025, 2026].map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleGerarModeloA}
            disabled={gerarMutation.isPending}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-boho-accent hover:bg-boho-accent-hover text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {gerarMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Calculator className="w-4 h-4" />
            )}
            Gerar Modelo A
          </button>
        </div>
      </FiscalCard>

      {/* Resumo IVA */}
      {declaracaoAtual && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <FiscalCard className="bg-gradient-to-br from-boho-terracotta/10 to-boho-terracotta/5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-boho-terracotta/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-boho-terracotta" />
              </div>
              <div>
                <p className="text-2xl font-bold text-boho-coffee">
                  MZN {declaracaoAtual.q6IvaLiquidado.toLocaleString('pt-MZ')}
                </p>
                <p className="text-sm text-boho-brown">IVA Liquidado</p>
              </div>
            </div>
          </FiscalCard>

          <FiscalCard className="bg-gradient-to-br from-boho-sage/10 to-boho-sage/5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-boho-sage/10 rounded-lg">
                <TrendingDown className="w-6 h-6 text-boho-sage" />
              </div>
              <div>
                <p className="text-2xl font-bold text-boho-coffee">
                  MZN {declaracaoAtual.q6IvaDedutivel.toLocaleString('pt-MZ')}
                </p>
                <p className="text-sm text-boho-brown">IVA Dedutível</p>
              </div>
            </div>
          </FiscalCard>

          <FiscalCard className={`bg-gradient-to-br ${declaracaoAtual.q6IvaAPagar > 0 ? 'from-boho-mustard/10 to-boho-mustard/5' : 'from-boho-sage/10 to-boho-sage/5'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${declaracaoAtual.q6IvaAPagar > 0 ? 'bg-boho-mustard/10' : 'bg-boho-sage/10'}`}>
                {declaracaoAtual.q6IvaAPagar > 0 ? (
                  <AlertTriangle className="w-6 h-6 text-boho-mustard" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-boho-sage" />
                )}
              </div>
              <div>
                <p className="text-2xl font-bold text-boho-coffee">
                  MZN {Math.abs(declaracaoAtual.q6IvaAPagar > 0 ? declaracaoAtual.q6IvaAPagar : declaracaoAtual.q6CreditoTransportar).toLocaleString('pt-MZ')}
                </p>
                <p className="text-sm text-boho-brown">
                  {declaracaoAtual.q6IvaAPagar > 0 ? 'IVA a Pagar' : 'Crédito a Transportar'}
                </p>
              </div>
            </div>
          </FiscalCard>

          <FiscalCard className="bg-gradient-to-br from-boho-coffee/10 to-boho-coffee/5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-boho-coffee/10 rounded-lg">
                <FileText className="w-6 h-6 text-boho-coffee" />
              </div>
              <div>
                <p className="text-2xl font-bold text-boho-coffee">
                  {declaracaoAtual.estado}
                </p>
                <p className="text-sm text-boho-brown">Estado</p>
              </div>
            </div>
          </FiscalCard>
        </div>
      )}

      {/* Detalhes do Modelo A */}
      {declaracaoAtual && (
        <FiscalCard className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-boho-coffee">
              Modelo A - {meses.find(m => m.value === declaracaoAtual.periodoMes)?.label}/{declaracaoAtual.periodoAno}
            </h2>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 border border-boho-beige hover:border-boho-accent text-boho-brown rounded-lg transition-colors">
                <Download size={18} />
                XML
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-boho-beige hover:border-boho-accent text-boho-brown rounded-lg transition-colors">
                <Download size={18} />
                PDF
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Quadros de Vendas */}
            <div className="space-y-4">
              <h3 className="font-medium text-boho-coffee">Quadros de Vendas</h3>
              <div className="p-4 bg-boho-sand/30 rounded-lg">
                <p className="text-sm text-boho-brown">Q1 - Vendas 16%</p>
                <p className="text-lg font-mono text-boho-coffee">
                  MZN {(declaracaoAtual.q1VendasBens16 + declaracaoAtual.q1VendasServicos16).toLocaleString('pt-MZ')}
                </p>
                <p className="text-xs text-boho-taupe">
                  IVA: MZN {declaracaoAtual.q1TotalIva16.toLocaleString('pt-MZ')}
                </p>
              </div>
              <div className="p-4 bg-boho-sand/30 rounded-lg">
                <p className="text-sm text-boho-brown">Q2 - Vendas 10%</p>
                <p className="text-lg font-mono text-boho-coffee">
                  MZN {(declaracaoAtual.q2VendasBens10 + declaracaoAtual.q2VendasServicos10).toLocaleString('pt-MZ')}
                </p>
                <p className="text-xs text-boho-taupe">
                  IVA: MZN {declaracaoAtual.q2TotalIva10.toLocaleString('pt-MZ')}
                </p>
              </div>
              <div className="p-4 bg-boho-sand/30 rounded-lg">
                <p className="text-sm text-boho-brown">Q3 - Vendas 5%</p>
                <p className="text-lg font-mono text-boho-coffee">
                  MZN {(declaracaoAtual.q3VendasBens5 + declaracaoAtual.q3VendasServicos5).toLocaleString('pt-MZ')}
                </p>
                <p className="text-xs text-boho-taupe">
                  IVA: MZN {declaracaoAtual.q3TotalIva5.toLocaleString('pt-MZ')}
                </p>
              </div>
            </div>

            {/* Quadros de Compras */}
            <div className="space-y-4">
              <h3 className="font-medium text-boho-coffee">Quadros de Compras</h3>
              <div className="p-4 bg-boho-sand/30 rounded-lg">
                <p className="text-sm text-boho-brown">Q5 - Compras 16%</p>
                <p className="text-lg font-mono text-boho-coffee">
                  MZN {(declaracaoAtual.q5ComprasBens16 + declaracaoAtual.q5ComprasServicos16).toLocaleString('pt-MZ')}
                </p>
                <p className="text-xs text-boho-taupe">
                  IVA: MZN {declaracaoAtual.q5Iva16.toLocaleString('pt-MZ')}
                </p>
              </div>
              <div className="p-4 bg-boho-sand/30 rounded-lg">
                <p className="text-sm text-boho-brown">Q5 - Compras 5%</p>
                <p className="text-lg font-mono text-boho-coffee">
                  MZN {(declaracaoAtual.q5ComprasBens5 + declaracaoAtual.q5ComprasServicos5).toLocaleString('pt-MZ')}
                </p>
                <p className="text-xs text-boho-taupe">
                  IVA: MZN {declaracaoAtual.q5Iva5.toLocaleString('pt-MZ')}
                </p>
              </div>
              <div className="p-4 bg-boho-sand/30 rounded-lg">
                <p className="text-sm text-boho-brown">Q5 - Importações</p>
                <p className="text-lg font-mono text-boho-coffee">
                  MZN {(declaracaoAtual.q5ImportacoesBens + declaracaoAtual.q5ImportacoesServicos).toLocaleString('pt-MZ')}
                </p>
                <p className="text-xs text-boho-taupe">
                  IVA: MZN {declaracaoAtual.q5ImportacoesIva.toLocaleString('pt-MZ')}
                </p>
              </div>
            </div>

            {/* Apuramento */}
            <div className="space-y-4">
              <h3 className="font-medium text-boho-coffee">Quadro 06 - Apuramento</h3>
              <div className="p-4 bg-boho-accent/10 rounded-lg">
                <p className="text-sm text-boho-brown">IVA Liquidado</p>
                <p className="text-lg font-mono text-boho-coffee">
                  MZN {declaracaoAtual.q6IvaLiquidado.toLocaleString('pt-MZ')}
                </p>
              </div>
              <div className="p-4 bg-boho-sage/10 rounded-lg">
                <p className="text-sm text-boho-brown">IVA Dedutível</p>
                <p className="text-lg font-mono text-boho-coffee">
                  MZN {declaracaoAtual.q6IvaDedutivel.toLocaleString('pt-MZ')}
                </p>
              </div>
              <div className="p-4 bg-boho-mustard/10 rounded-lg">
                <p className="text-sm text-boho-brown">Diferença</p>
                <p className="text-lg font-mono text-boho-coffee">
                  MZN {declaracaoAtual.q6Diferenca.toLocaleString('pt-MZ')}
                </p>
              </div>
              {declaracaoAtual.q6CreditoAnterior > 0 && (
                <div className="p-4 bg-boho-coffee/10 rounded-lg">
                  <p className="text-sm text-boho-brown">Crédito do Período Anterior</p>
                  <p className="text-lg font-mono text-boho-coffee">
                    MZN {declaracaoAtual.q6CreditoAnterior.toLocaleString('pt-MZ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </FiscalCard>
      )}

      {!declaracaoAtual && !isLoading && (
        <FiscalCard className="mb-8 text-center py-12">
          <Calculator className="w-16 h-16 text-boho-taupe mx-auto mb-4" />
          <h3 className="text-lg font-medium text-boho-coffee mb-2">
            Nenhuma declaração encontrada
          </h3>
          <p className="text-boho-brown mb-4">
            Gere o Modelo A para o período selecionado para ver os detalhes.
          </p>
          <button
            onClick={handleGerarModeloA}
            disabled={gerarMutation.isPending}
            className="px-6 py-3 bg-boho-accent hover:bg-boho-accent-hover text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {gerarMutation.isPending ? 'Gerando...' : 'Gerar Modelo A'}
          </button>
        </FiscalCard>
      )}

      {/* Faturas Recentes */}
      <FiscalCard>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-boho-coffee">Faturas Recentes</h2>
          <Link
            to="/my-documents"
            className="text-boho-accent hover:text-boho-accent-hover font-medium text-sm"
          >
            Ver todas
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-boho-beige">
                <th className="text-left py-4 px-4 text-boho-taupe font-medium">Documento</th>
                <th className="text-left py-4 px-4 text-boho-taupe font-medium">Cliente</th>
                <th className="text-right py-4 px-4 text-boho-taupe font-medium">Valor</th>
                <th className="text-right py-4 px-4 text-boho-taupe font-medium">IVA</th>
                <th className="text-left py-4 px-4 text-boho-taupe font-medium">Hash</th>
                <th className="text-left py-4 px-4 text-boho-taupe font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {faturas?.items?.map((fatura: any) => (
                <tr key={fatura.id} className="border-b border-boho-beige/50 hover:bg-boho-sand/30">
                  <td className="py-4 px-4">
                    <span className="font-mono text-boho-accent font-medium">{fatura.numeroCompleto}</span>
                  </td>
                  <td className="py-4 px-4 text-boho-coffee">{fatura.entidade?.nome || 'N/A'}</td>
                  <td className="py-4 px-4 text-right font-mono">
                    MZN {(fatura.totalPagar || 0).toLocaleString('pt-MZ')}
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-boho-brown">
                    MZN {(fatura.totalIva || 0).toLocaleString('pt-MZ')}
                  </td>
                  <td className="py-4 px-4">
                    <code className="text-xs text-boho-taupe bg-boho-sand px-2 py-1 rounded">
                      {fatura.hashFiscal ? fatura.hashFiscal.substring(0, 8) + '...' : 'N/A'}
                    </code>
                  </td>
                  <td className="py-4 px-4 text-boho-brown">
                    {new Date(fatura.dataEmissao).toLocaleDateString('pt-MZ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FiscalCard>
    </div>
  )
}

-- =============================================================================
-- FISCAL.MZ 2.0 - QUERIES EXEMPLOS
-- B2B Marketplace & Payment Orchestration
-- =============================================================================

-- =============================================================================
-- 1. PROFORMAS PENDENTES DE PAGAMENTO > 5 DIAS
-- =============================================================================

-- Query básica
SELECT 
    p.id,
    p.numero_proforma,
    p.data_emissao,
    p.total_geral,
    p.status,
    CURRENT_DATE - p.data_emissao as dias_em_aberto,
    t.nome as tenant_nome,
    c.nome as cliente_nome,
    c.email as cliente_email,
    c.telefone as cliente_telefone,
    p.validade_ate - CURRENT_DATE as dias_ate_vencimento
FROM proformas p
JOIN tenants t ON t.id = p.tenant_id
JOIN clientes c ON c.id = p.cliente_id
WHERE p.status = 'PENDENTE'
    AND CURRENT_DATE - p.data_emissao > 5
ORDER BY p.data_emissao ASC;

-- Query com alerta de prioridade
SELECT 
    p.id,
    p.numero_proforma,
    p.data_emissao,
    p.total_geral,
    CASE 
        WHEN CURRENT_DATE - p.data_emissao > 15 THEN 'CRÍTICO'
        WHEN CURRENT_DATE - p.data_emissao > 10 THEN 'ALTO'
        WHEN CURRENT_DATE - p.data_emissao > 5 THEN 'MÉDIO'
        ELSE 'BAIXO'
    END as nivel_alerta,
    t.nome as tenant_nome,
    c.nome as cliente_nome,
    c.email as cliente_email
FROM proformas p
JOIN tenants t ON t.id = p.tenant_id
JOIN clientes c ON c.id = p.cliente_id
WHERE p.status = 'PENDENTE'
    AND CURRENT_DATE - p.data_emissao > 5
ORDER BY 
    CASE 
        WHEN CURRENT_DATE - p.data_emissao > 15 THEN 1
        WHEN CURRENT_DATE - p.data_emissao > 10 THEN 2
        WHEN CURRENT_DATE - p.data_emissao > 5 THEN 3
        ELSE 4
    END,
    p.data_emissao;

-- =============================================================================
-- 2. PROFORMAS PRÓXIMAS DO VENCIMENTO (Alerta preventivo)
-- =============================================================================

SELECT 
    p.id,
    p.numero_proforma,
    p.data_emissao,
    p.validade_ate,
    p.total_geral,
    p.validade_ate - CURRENT_DATE as dias_ate_vencimento,
    CASE 
        WHEN p.validade_ate - CURRENT_DATE <= 0 THEN 'VENCIDA'
        WHEN p.validade_ate - CURRENT_DATE <= 3 THEN 'VENCE_EM_3_DIAS'
        WHEN p.validade_ate - CURRENT_DATE <= 7 THEN 'VENCE_EM_7_DIAS'
        ELSE 'NORMAL'
    END as status_vencimento,
    t.nome as tenant_nome,
    c.nome as cliente_nome,
    c.email as cliente_email,
    c.telefone as cliente_telefone
FROM proformas p
JOIN tenants t ON t.id = p.tenant_id
JOIN clientes c ON c.id = p.cliente_id
WHERE p.status = 'PENDENTE'
    AND p.validade_ate <= CURRENT_DATE + INTERVAL '7 days'
ORDER BY p.validade_ate ASC;

-- =============================================================================
-- 3. CONCILIAÇÃO BANCÁRIA - Pagamentos por gateway_ref
-- =============================================================================

-- Listar pagamentos pendentes de conciliação
SELECT 
    p.id,
    p.gateway_ref,
    p.metodo,
    p.valor,
    p.moeda,
    p.estado,
    p.created_at,
    p.processed_at,
    EXTRACT(EPOCH FROM (COALESCE(p.processed_at, NOW()) - p.created_at))/60 as minutos_processamento,
    t.nome as tenant_nome,
    c.nome as cliente_nome,
    pr.numero_proforma,
    df.numero_documento as numero_fatura
FROM pagamentos p
JOIN tenants t ON t.id = p.tenant_id
JOIN clientes c ON c.id = p.cliente_id
LEFT JOIN proformas pr ON pr.id = p.proforma_id
LEFT JOIN documentos_fiscais df ON df.id = p.fatura_id
WHERE p.estado IN ('PENDENTE', 'PROCESSANDO')
    AND p.created_at < NOW() - INTERVAL '30 minutes'
ORDER BY p.created_at ASC;

-- Resumo de conciliação por gateway
SELECT 
    p.metodo,
    p.estado,
    COUNT(*) as total_transacoes,
    SUM(p.valor) as valor_total,
    AVG(EXTRACT(EPOCH FROM (COALESCE(p.processed_at, NOW()) - p.created_at))/60) as tempo_medio_minutos
FROM pagamentos p
WHERE p.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.metodo, p.estado
ORDER BY p.metodo, p.estado;

-- =============================================================================
-- 4. COTAÇÕES EM NEGOCIAÇÃO - Dashboard do vendedor
-- =============================================================================

SELECT 
    wn.id,
    wn.status,
    wn.total_estimado,
    wn.validade_ate,
    wn.validade_ate - CURRENT_DATE as dias_restantes,
    jsonb_array_length(wn.historico_negociacao) as total_interacoes,
    (
        SELECT (h->>'data')::timestamptz 
        FROM jsonb_array_elements(wn.historico_negociacao) h 
        ORDER BY (h->>'data')::timestamptz DESC 
        LIMIT 1
    ) as ultima_interacao,
    t.nome as tenant_nome,
    c.nome as cliente_nome,
    c.email as cliente_email,
    jsonb_pretty(wn.itens) as itens_detalhe
FROM workflow_negociacoes wn
JOIN tenants t ON t.id = wn.tenant_id
JOIN clientes c ON c.id = wn.cliente_id
WHERE wn.status IN ('ENVIADA', 'NEGOCIANDO')
    AND wn.validade_ate >= CURRENT_DATE
ORDER BY wn.updated_at DESC;

-- =============================================================================
-- 5. HISTÓRICO DE NEGOCIAÇÃO DE UMA COTAÇÃO ESPECÍFICA
-- =============================================================================

WITH cotacao_itens AS (
    SELECT 
        wn.id,
        jsonb_array_elements(wn.itens) as item
    FROM workflow_negociacoes wn
    WHERE wn.id = 'UUID_DA_COTACAO_AQUI'
)
SELECT 
    wn.id as cotacao_id,
    wn.status,
    c.nome as cliente,
    t.nome as vendedor,
    wn.total_estimado,
    wn.validade_ate,
    -- Histórico detalhado
    hist->>'data' as data_hora,
    hist->>'autor_tipo' as autor,
    hist->>'tipo' as tipo_acao,
    hist->>'campo_afectado' as campo,
    hist->>'valor_anterior' as valor_anterior,
    hist->>'valor_novo' as valor_novo,
    hist->>'comentario' as comentario
FROM workflow_negociacoes wn
JOIN tenants t ON t.id = wn.tenant_id
JOIN clientes c ON c.id = wn.cliente_id
LEFT JOIN LATERAL jsonb_array_elements(wn.historico_negociacao) hist ON true
WHERE wn.id = 'UUID_DA_COTACAO_AQUI'
ORDER BY hist->>'data';

-- =============================================================================
-- 6. FATURAS PENDENTES DE PAGAMENTO - Aging Report
-- =============================================================================

SELECT 
    df.id,
    df.numero_documento,
    df.tipo,
    df.data_emissao,
    df.data_vencimento,
    df.total_geral,
    df.valor_pago,
    df.total_geral - df.valor_pago as saldo_pendente,
    CURRENT_DATE - df.data_vencimento as dias_atraso,
    CASE 
        WHEN CURRENT_DATE - df.data_vencimento <= 0 THEN 'NO_PRAZO'
        WHEN CURRENT_DATE - df.data_vencimento <= 30 THEN '1_30_DIAS'
        WHEN CURRENT_DATE - df.data_vencimento <= 60 THEN '31_60_DIAS'
        WHEN CURRENT_DATE - df.data_vencimento <= 90 THEN '61_90_DIAS'
        ELSE 'MAIS_90_DIAS'
    END as faixa_atraso,
    t.nome as tenant_nome,
    c.nome as cliente_nome,
    c.email as cliente_email,
    c.telefone as cliente_telefone,
    c.credito_autorizado
FROM documentos_fiscais df
JOIN tenants t ON t.id = df.tenant_id
JOIN clientes c ON c.id = df.cliente_id
WHERE df.estado = 'ATIVO'
    AND df.estado_pagamento IN ('PENDENTE', 'PARCIAL')
    AND df.tipo IN ('FT', 'FR')
ORDER BY df.data_vencimento ASC;

-- Resumo aging por cliente
SELECT 
    c.nome as cliente_nome,
    c.nif,
    COUNT(*) as total_faturas,
    SUM(df.total_geral - df.valor_pago) as total_pendente,
    SUM(CASE WHEN CURRENT_DATE - df.data_vencimento <= 0 THEN df.total_geral - df.valor_pago ELSE 0 END) as no_prazo,
    SUM(CASE WHEN CURRENT_DATE - df.data_vencimento BETWEEN 1 AND 30 THEN df.total_geral - df.valor_pago ELSE 0 END) as atraso_1_30,
    SUM(CASE WHEN CURRENT_DATE - df.data_vencimento BETWEEN 31 AND 60 THEN df.total_geral - df.valor_pago ELSE 0 END) as atraso_31_60,
    SUM(CASE WHEN CURRENT_DATE - df.data_vencimento BETWEEN 61 AND 90 THEN df.total_geral - df.valor_pago ELSE 0 END) as atraso_61_90,
    SUM(CASE WHEN CURRENT_DATE - df.data_vencimento > 90 THEN df.total_geral - df.valor_pago ELSE 0 END) as atraso_mais_90
FROM documentos_fiscais df
JOIN clientes c ON c.id = df.cliente_id
WHERE df.estado = 'ATIVO'
    AND df.estado_pagamento IN ('PENDENTE', 'PARCIAL')
GROUP BY c.id, c.nome, c.nif
HAVING SUM(df.total_geral - df.valor_pago) > 0
ORDER BY total_pendente DESC;

-- =============================================================================
-- 7. WALLET BALANCE - Detalhamento por Tenant
-- =============================================================================

-- Saldo consolidado com movimentos pendentes
SELECT 
    t.id as tenant_id,
    t.nome as tenant_nome,
    t.wallet_balance as saldo_disponivel,
    COALESCE(escrow.em_escrow, 0) as valor_em_escrow,
    COALESCE(saques.saques_pendentes, 0) as saques_pendentes,
    t.wallet_balance + COALESCE(escrow.em_escrow, 0) as saldo_total,
    t.conta_bancaria->>'iban' as iban_cadastrado,
    t.conta_bancaria->>'banco' as banco
FROM tenants t
LEFT JOIN (
    SELECT 
        tenant_id,
        SUM(valor) as em_escrow
    FROM pagamentos
    WHERE is_escrow = TRUE
        AND estado = 'CONCLUIDO'
        AND escrow_release_date IS NULL
    GROUP BY tenant_id
) escrow ON escrow.tenant_id = t.id
LEFT JOIN (
    SELECT 
        tenant_id,
        SUM(valor) as saques_pendentes
    FROM wallet_saques
    WHERE estado IN ('PENDENTE', 'PROCESSANDO')
    GROUP BY tenant_id
) saques ON saques.tenant_id = t.id
WHERE t.wallet_balance > 0 
    OR COALESCE(escrow.em_escrow, 0) > 0
ORDER BY t.wallet_balance DESC;

-- Histórico de movimentos da wallet
SELECT 
    p.id,
    p.metodo,
    p.valor,
    p.estado,
    p.is_escrow,
    p.escrow_release_date,
    p.created_at,
    c.nome as cliente_nome,
    pr.numero_proforma,
    df.numero_documento as numero_fatura,
    CASE 
        WHEN p.estado = 'CONCLUIDO' AND p.is_escrow AND p.escrow_release_date IS NULL THEN 'RETIDO_ESCROW'
        WHEN p.estado = 'CONCLUIDO' THEN 'DISPONIVEL'
        ELSE 'PENDENTE'
    END as situacao_valor
FROM pagamentos p
JOIN clientes c ON c.id = p.cliente_id
LEFT JOIN proformas pr ON pr.id = p.proforma_id
LEFT JOIN documentos_fiscais df ON df.id = p.fatura_id
WHERE p.tenant_id = 'UUID_DO_TENANT_AQUI'
ORDER BY p.created_at DESC
LIMIT 50;

-- =============================================================================
-- 8. FLUXO DE CONVERSÃO: Cotação → Proforma → FT → Recibo
-- =============================================================================

-- Rastreamento completo de uma venda
WITH venda_completa AS (
    SELECT 
        wn.id as cotacao_id,
        wn.status as cotacao_status,
        wn.total_estimado as cotacao_valor,
        wn.created_at as cotacao_data,
        p.id as proforma_id,
        p.numero_proforma,
        p.status as proforma_status,
        p.total_geral as proforma_valor,
        p.data_emissao as proforma_data,
        p.condicoes_pagamento,
        df.id as fatura_id,
        df.numero_documento as numero_fatura,
        df.tipo as tipo_fatura,
        df.estado_pagamento,
        df.total_geral as fatura_valor,
        df.data_emissao as fatura_data,
        r.id as recibo_id,
        r.numero_recibo,
        r.valor_recebido as recibo_valor,
        r.data_recibo
    FROM workflow_negociacoes wn
    LEFT JOIN proformas p ON p.cotacao_id = wn.id
    LEFT JOIN documentos_fiscais df ON df.proforma_origin_id = p.id
    LEFT JOIN recibos r ON r.fatura_id = df.id
    WHERE wn.id = 'UUID_DA_COTACAO_AQUI'
)
SELECT * FROM venda_completa;

-- Listar vendas incompletas (proforma sem FT, FT sem recibo, etc)
-- Proformas pagas sem FT gerada
SELECT 
    p.id,
    p.numero_proforma,
    p.total_geral,
    p.status,
    p.updated_at as data_pagamento,
    t.nome as tenant_nome,
    c.nome as cliente_nome
FROM proformas p
JOIN tenants t ON t.id = p.tenant_id
JOIN clientes c ON c.id = p.cliente_id
LEFT JOIN documentos_fiscais df ON df.proforma_origin_id = p.id
WHERE p.status = 'PAGA'
    AND df.id IS NULL;

-- FT pagas sem recibo
SELECT 
    df.id,
    df.numero_documento,
    df.total_geral,
    df.valor_pago,
    df.estado_pagamento,
    t.nome as tenant_nome,
    c.nome as cliente_nome
FROM documentos_fiscais df
JOIN tenants t ON t.id = df.tenant_id
JOIN clientes c ON c.id = df.cliente_id
LEFT JOIN recibos r ON r.fatura_id = df.id
WHERE df.estado_pagamento = 'PAGO'
    AND r.id IS NULL;

-- =============================================================================
-- 9. PAGAMENTOS EM ESCROW - Gestão de Garantias
-- =============================================================================

-- Listar pagamentos em escrow pendentes de libertação
SELECT 
    p.id,
    p.valor,
    p.escrow_release_date,
    p.escrow_release_condition,
    p.created_at as data_deposito,
    CURRENT_DATE - p.created_at::date as dias_em_escrow,
    t.nome as tenant_nome,
    c.nome as cliente_nome,
    pr.numero_proforma,
    pr.total_geral as valor_proforma
FROM pagamentos p
JOIN tenants t ON t.id = p.tenant_id
JOIN clientes c ON c.id = p.cliente_id
JOIN proformas pr ON pr.id = p.proforma_id
WHERE p.is_escrow = TRUE
    AND p.estado = 'CONCLUIDO'
    AND p.escrow_release_date IS NULL
ORDER BY p.created_at ASC;

-- =============================================================================
-- 10. METRICS E KPIs - Dashboard
-- =============================================================================

-- Resumo diário de vendas
SELECT 
    CURRENT_DATE as data,
    COUNT(DISTINCT df.id) as total_faturas,
    SUM(df.total_geral) as valor_total_vendas,
    AVG(df.total_geral) as ticket_medio,
    COUNT(DISTINCT CASE WHEN df.proforma_origin_id IS NOT NULL THEN df.id END) as faturas_de_proforma,
    SUM(CASE WHEN df.proforma_origin_id IS NOT NULL THEN df.total_geral ELSE 0 END) as valor_vendas_b2b
FROM documentos_fiscais df
WHERE df.data_emissao = CURRENT_DATE
    AND df.estado = 'ATIVO';

-- Taxa de conversão: Cotações → Proformas → FT
WITH stats AS (
    SELECT 
        DATE_TRUNC('month', wn.created_at) as mes,
        COUNT(*) FILTER (WHERE wn.created_at IS NOT NULL) as total_cotacoes,
        COUNT(*) FILTER (WHERE wn.status = 'CONVERTIDA') as cotacoes_convertidas,
        COUNT(*) FILTER (WHERE wn.status = 'ACEITE') as cotacoes_aceites,
        COUNT(*) FILTER (WHERE wn.status = 'REJEITADA') as cotacoes_rejeitadas
    FROM workflow_negociacoes wn
    WHERE wn.created_at >= CURRENT_DATE - INTERVAL '6 months'
    GROUP BY DATE_TRUNC('month', wn.created_at)
)
SELECT 
    mes,
    total_cotacoes,
    cotacoes_convertidas,
    cotacoes_aceites,
    cotacoes_rejeitadas,
    ROUND(cotacoes_aceites::numeric / NULLIF(total_cotacoes, 0) * 100, 2) as taxa_aceitacao_pct,
    ROUND(cotacoes_convertidas::numeric / NULLIF(total_cotacoes, 0) * 100, 2) as taxa_conversao_pct
FROM stats
ORDER BY mes DESC;

-- Performance de pagamentos por método
SELECT 
    p.metodo,
    COUNT(*) as total_transacoes,
    SUM(CASE WHEN p.estado = 'CONCLUIDO' THEN 1 ELSE 0 END) as sucessos,
    SUM(CASE WHEN p.estado = 'FALHADO' THEN 1 ELSE 0 END) as falhas,
    SUM(CASE WHEN p.estado = 'CONCLUIDO' THEN p.valor ELSE 0 END) as valor_processado,
    ROUND(
        SUM(CASE WHEN p.estado = 'CONCLUIDO' THEN 1 ELSE 0 END)::numeric / 
        COUNT(*) * 100, 
        2
    ) as taxa_sucesso_pct,
    AVG(
        CASE 
            WHEN p.estado = 'CONCLUIDO' THEN 
                EXTRACT(EPOCH FROM (p.processed_at - p.created_at))
            ELSE NULL 
        END
    ) as tempo_medio_segundos
FROM pagamentos p
WHERE p.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.metodo
ORDER BY valor_processado DESC;

-- =============================================================================
-- 11. PAGAMENTOS FALHADOS - Análise e Retentativa
-- =============================================================================

-- Listar pagamentos falhados com motivo
SELECT 
    p.id,
    p.metodo,
    p.valor,
    p.failed_reason,
    p.created_at,
    p.updated_at,
    jsonb_pretty(p.gateway_resposta) as resposta_gateway,
    t.nome as tenant_nome,
    c.nome as cliente_nome,
    c.email as cliente_email,
    pr.numero_proforma,
    df.numero_documento as numero_fatura
FROM pagamentos p
JOIN tenants t ON t.id = p.tenant_id
JOIN clientes c ON c.id = p.cliente_id
LEFT JOIN proformas pr ON pr.id = p.proforma_id
LEFT JOIN documentos_fiscais df ON df.id = p.fatura_id
WHERE p.estado = 'FALHADO'
    AND p.created_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY p.created_at DESC;

-- =============================================================================
-- 12. AUDITORIA - Log de alterações em pagamentos
-- =============================================================================

-- Histórico de mudanças de estado de um pagamento
SELECT 
    alp.id as log_id,
    alp.estado_anterior,
    alp.estado_novo,
    alp.alterado_em,
    alp.motivo,
    alp.metadata,
    p.valor,
    p.metodo,
    t.nome as tenant_nome
FROM audit_log_pagamentos alp
JOIN pagamentos p ON p.id = alp.pagamento_id
JOIN tenants t ON t.id = p.tenant_id
WHERE alp.pagamento_id = 'UUID_DO_PAGAMENTO_AQUI'
ORDER BY alp.alterado_em;

-- Resumo de alterações recentes
SELECT 
    DATE_TRUNC('day', alp.alterado_em) as data,
    COUNT(*) as total_alteracoes,
    COUNT(*) FILTER (WHERE alp.estado_novo = 'CONCLUIDO') as aprovacoes,
    COUNT(*) FILTER (WHERE alp.estado_novo = 'FALHADO') as falhas,
    COUNT(*) FILTER (WHERE alp.estado_novo = 'REEMBOLSADO') as reembolsos
FROM audit_log_pagamentos alp
WHERE alp.alterado_em >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE_TRUNC('day', alp.alterado_em)
ORDER BY data DESC;

-- =============================================================================
-- 13. SAQUES DA WALLET - Gestão
-- =============================================================================

-- Saques pendentes de processamento
SELECT 
    ws.id,
    ws.valor,
    ws.metodo,
    ws.estado,
    ws.conta_destino->>'banco' as banco,
    ws.conta_destino->>'iban' as iban,
    ws.conta_destino->>'titular' as titular,
    ws.created_at as data_solicitacao,
    t.nome as tenant_nome,
    t.wallet_balance as saldo_atual
FROM wallet_saques ws
JOIN tenants t ON t.id = ws.tenant_id
WHERE ws.estado IN ('PENDENTE', 'PROCESSANDO')
ORDER BY ws.created_at ASC;

-- Histórico de saques por tenant
SELECT 
    t.nome as tenant_nome,
    COUNT(*) FILTER (WHERE ws.estado = 'CONCLUIDO') as saques_concluidos,
    COUNT(*) FILTER (WHERE ws.estado = 'REJEITADO') as saques_rejeitados,
    SUM(ws.valor) FILTER (WHERE ws.estado = 'CONCLUIDO') as total_sacado,
    AVG(ws.valor) FILTER (WHERE ws.estado = 'CONCLUIDO') as valor_medio_saque
FROM wallet_saques ws
JOIN tenants t ON t.id = ws.tenant_id
WHERE ws.created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY t.id, t.nome
ORDER BY total_sacado DESC;

-- =============================================================================
-- 14. PRODUTOS MAIS COTADOS/VENDIDOS - Analytics
-- =============================================================================

-- Produtos mais cotados
SELECT 
    p.id as produto_id,
    p.codigo,
    p.descricao,
    COUNT(DISTINCT wn.id) as total_cotacoes,
    SUM((item->>'quantidade')::decimal) as total_quantidade_cotada,
    AVG((item->>'preco_unit')::decimal) as preco_medio_cotado
FROM produtos p
JOIN workflow_negociacoes wn ON wn.itens @> jsonb_build_array(jsonb_build_object('produto_id', p.id::text))
CROSS JOIN LATERAL jsonb_array_elements(wn.itens) item
WHERE wn.created_at >= CURRENT_DATE - INTERVAL '90 days'
    AND (item->>'produto_id')::uuid = p.id
GROUP BY p.id, p.codigo, p.descricao
ORDER BY total_cotacoes DESC
LIMIT 20;

-- =============================================================================
-- 15. VALIDAÇÃO DE INTEGRIDADE - Queries de Verificação
-- =============================================================================

-- Verificar se há proformas duplicadas para mesma cotação
SELECT 
    cotacao_id,
    COUNT(*) as total_proformas,
    COUNT(*) FILTER (WHERE status NOT IN ('CANCELADA', 'VENCIDA')) as ativas
FROM proformas
WHERE cotacao_id IS NOT NULL
GROUP BY cotacao_id
HAVING COUNT(*) FILTER (WHERE status NOT IN ('CANCELADA', 'VENCIDA')) > 1;

-- Verificar inconsistências: FT com proforma_origin mas proforma não paga
SELECT 
    df.id,
    df.numero_documento,
    df.total_geral,
    p.numero_proforma,
    p.status as proforma_status,
    p.total_geral as proforma_valor,
    ABS(df.total_geral - p.total_geral) as diferenca
FROM documentos_fiscais df
JOIN proformas p ON p.id = df.proforma_origin_id
WHERE df.tipo = 'FT'
    AND p.status != 'PAGA';

-- Verificar pagamentos concluídos sem atualização de wallet
SELECT 
    p.id,
    p.tenant_id,
    p.valor,
    p.estado,
    t.wallet_balance,
    p.created_at
FROM pagamentos p
JOIN tenants t ON t.id = p.tenant_id
WHERE p.estado = 'CONCLUIDO'
    AND p.created_at > (
        SELECT MAX(created_at) FROM wallet_saques ws 
        WHERE ws.tenant_id = p.tenant_id AND ws.estado = 'CONCLUIDO'
    )
ORDER BY p.created_at DESC
LIMIT 50;

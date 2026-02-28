-- ============================================================
-- FUNÇÕES E STORED PROCEDURES
-- FISCAL.MZ Enterprise
-- ============================================================

-- Função: Movimentar stock (usada pelo workflow)
CREATE OR REPLACE FUNCTION movimentar_stock(
    p_empresa_id UUID,
    p_artigo_id UUID,
    p_documento_id UUID,
    p_tipo VARCHAR(10),
    p_quantidade INTEGER,
    p_documento_tipo VARCHAR(20),
    p_documento_numero VARCHAR(30),
    p_utilizador_id UUID
) RETURNS VOID AS $$
DECLARE
    v_stock_anterior INTEGER;
    v_stock_posterior INTEGER;
    v_custo_medio DECIMAL(10,2);
BEGIN
    -- Obter stock atual com lock
    SELECT stock_atual, preco_custo 
    INTO v_stock_anterior, v_custo_medio
    FROM artigos 
    WHERE id = p_artigo_id
    FOR UPDATE;

    -- Calcular novo stock
    IF p_tipo = 'ENTRADA' OR p_tipo = 'DEVOLUCAO' OR p_tipo = 'AJUSTE' THEN
        v_stock_posterior := v_stock_anterior + p_quantidade;
    ELSE -- SAIDA
        v_stock_posterior := v_stock_anterior - p_quantidade;
        
        -- Verificar se há stock suficiente
        IF v_stock_posterior < 0 THEN
            RAISE EXCEPTION 'Stock insuficiente para o artigo %', p_artigo_id;
        END IF;
    END IF;

    -- Atualizar artigo
    UPDATE artigos 
    SET stock_atual = v_stock_posterior,
        updated_at = NOW()
    WHERE id = p_artigo_id;

    -- Registrar movimento
    INSERT INTO movimentos_stock (
        empresa_id, artigo_id, documento_id, tipo, quantidade,
        stock_anterior, stock_posterior, custo_medio,
        documento_tipo, documento_numero, created_by, created_at
    ) VALUES (
        p_empresa_id, p_artigo_id, p_documento_id, p_tipo, p_quantidade,
        v_stock_anterior, v_stock_posterior, v_custo_medio,
        p_documento_tipo, p_documento_numero, p_utilizador_id, NOW()
    );

    -- Verificar stock mínimo e criar notificação se necessário
    IF v_stock_posterior <= (SELECT stock_minimo FROM artigos WHERE id = p_artigo_id) THEN
        INSERT INTO notificacoes (
            empresa_destinatario_id, tipo, titulo, mensagem, acao_url, acao_texto, created_at
        ) SELECT 
            empresa_id,
            'STOCK_BAIXO',
            'Stock Baixo: ' || descricao,
            'O artigo ' || codigo || ' - ' || descricao || ' está com stock baixo. Atual: ' || v_stock_posterior || ' (mínimo: ' || stock_minimo || ')',
            '/stock/artigos/' || id,
            'Repor Stock',
            NOW()
        FROM artigos
        WHERE id = p_artigo_id
        AND NOT EXISTS (
            SELECT 1 FROM notificacoes 
            WHERE empresa_destinatario_id = artigos.empresa_id 
            AND tipo = 'STOCK_BAIXO' 
            AND lida = FALSE
            AND created_at > NOW() - INTERVAL '1 day'
        );
    END IF;

END;
$$ LANGUAGE plpgsql;

-- Função: Calcular totais do documento
CREATE OR REPLACE FUNCTION calcular_totais_documento(p_documento_id UUID)
RETURNS TABLE (
    subtotal DECIMAL(12,2),
    total_descontos DECIMAL(12,2),
    total_iva DECIMAL(12,2),
    total_pagar DECIMAL(12,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(ld.preco_unitario * ld.quantidade), 0)::DECIMAL(12,2) as subtotal,
        COALESCE(SUM(ld.desconto_valor), 0)::DECIMAL(12,2) as total_descontos,
        COALESCE(SUM(ld.valor_iva), 0)::DECIMAL(12,2) as total_iva,
        COALESCE(SUM(ld.total_linha + ld.valor_iva), 0)::DECIMAL(12,2) as total_pagar
    FROM linhas_documento ld
    WHERE ld.documento_id = p_documento_id;
END;
$$ LANGUAGE plpgsql;

-- Função: Gerar Modelo A de IVA
CREATE OR REPLACE FUNCTION gerar_modelo_a(
    p_empresa_id UUID,
    p_ano INTEGER,
    p_mes INTEGER
) RETURNS UUID AS $$
DECLARE
    v_id UUID;
    v_credito_anterior DECIMAL(12,2);
    v_iva_liquidado DECIMAL(12,2);
    v_iva_dedutivel DECIMAL(12,2);
    v_diferenca DECIMAL(12,2);
    v_iva_a_pagar DECIMAL(12,2);
    v_credito_transportar DECIMAL(12,2);
BEGIN
    -- Buscar crédito do período anterior
    SELECT COALESCE(q6_credito_transportar, 0) INTO v_credito_anterior
    FROM declaracoes_iva
    WHERE empresa_id = p_empresa_id
        AND ((periodo_ano = p_ano AND periodo_mes = p_mes - 1) 
             OR (periodo_ano = p_ano - 1 AND periodo_mes = 12 AND p_mes = 1))
    ORDER BY periodo_ano DESC, periodo_mes DESC
    LIMIT 1;

    -- Inserir ou atualizar declaração
    INSERT INTO declaracoes_iva (
        empresa_id, periodo_ano, periodo_mes,
        q1_vendas_bens_16, q1_vendas_bens_iva,
        q1_vendas_servicos_16, q1_vendas_servicos_iva,
        q6_credito_periodo_anterior,
        created_at
    )
    SELECT 
        p_empresa_id, p_ano, p_mes,
        COALESCE(SUM(CASE WHEN d.operacao_iva = 'TRIBUTAVEL_16' AND a.tipo = 'PRODUTO' THEN ld.total_linha ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN d.operacao_iva = 'TRIBUTAVEL_16' AND a.tipo = 'PRODUTO' THEN ld.valor_iva ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN d.operacao_iva = 'TRIBUTAVEL_16' AND a.tipo = 'SERVICO' THEN ld.total_linha ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN d.operacao_iva = 'TRIBUTAVEL_16' AND a.tipo = 'SERVICO' THEN ld.valor_iva ELSE 0 END), 0),
        COALESCE(v_credito_anterior, 0),
        NOW()
    FROM documentos d
    JOIN linhas_documento ld ON d.id = ld.documento_id
    LEFT JOIN artigos a ON ld.artigo_id = a.id
    WHERE d.empresa_id = p_empresa_id
        AND d.tipo IN ('FACTURA', 'FACTURA_RECIBO')
        AND d.estado = 'EMITIDA'
        AND d.anulado = FALSE
        AND EXTRACT(YEAR FROM d.data_emissao) = p_ano
        AND EXTRACT(MONTH FROM d.data_emissao) = p_mes
    ON CONFLICT (empresa_id, periodo_ano, periodo_mes) 
    DO UPDATE SET
        q1_vendas_bens_16 = EXCLUDED.q1_vendas_bens_16,
        q1_vendas_bens_iva = EXCLUDED.q1_vendas_bens_iva,
        q1_vendas_servicos_16 = EXCLUDED.q1_vendas_servicos_16,
        q1_vendas_servicos_iva = EXCLUDED.q1_vendas_servicos_iva,
        updated_at = NOW()
    RETURNING id INTO v_id;

    -- Calcular apuramento
    SELECT 
        COALESCE(q1_total_iva_16, 0),
        COALESCE(q5_compras_bens_iva_16, 0) + COALESCE(q5_compras_servicos_iva_16, 0)
    INTO v_iva_liquidado, v_iva_dedutivel
    FROM declaracoes_iva
    WHERE id = v_id;

    v_diferenca := v_iva_liquidado - v_iva_dedutivel;

    IF v_diferenca > 0 THEN
        v_iva_a_pagar := v_diferenca - v_credito_anterior;
        IF v_iva_a_pagar < 0 THEN
            v_credito_transportar := ABS(v_iva_a_pagar);
            v_iva_a_pagar := 0;
        END IF;
    ELSE
        v_credito_transportar := ABS(v_diferenca) + v_credito_anterior;
    END IF;

    -- Atualizar apuramento
    UPDATE declaracoes_iva SET
        q6_iva_liquidado = v_iva_liquidado,
        q6_iva_dedutivel = v_iva_dedutivel,
        q6_diferenca = v_diferenca,
        q6_iva_a_pagar = v_iva_a_pagar,
        q6_credito_transportar = v_credito_transportar
    WHERE id = v_id;

    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

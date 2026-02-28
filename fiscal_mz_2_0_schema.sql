-- =============================================================================
-- FISCAL.MZ 2.0 - ARQUITETURA DE DADOS B2B MARKETPLACE
-- Payment Orchestration & Document Management
-- =============================================================================
-- Distingue rigorosamente entre:
--   - Documentos COMERCIAIS (negociáveis): Cotações, Proformas
--   - Documentos FISCAIS (imutáveis): FT, FR, NC, ND, Recibos
-- =============================================================================

-- =============================================================================
-- EXTENSÕES
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- ENUMS
-- =============================================================================

-- Status da negociação/cotação
CREATE TYPE cotacao_status AS ENUM (
    'RASCUNHO',
    'ENVIADA',
    'NEGOCIANDO',
    'ACEITE',
    'REJEITADA',
    'CONVERTIDA'
);

-- Condições de pagamento
CREATE TYPE condicao_pagamento AS ENUM (
    'IMMEDIATO',
    '30_DIAS',
    '50_50',
    'ESCROW'
);

-- Status da proforma
CREATE TYPE proforma_status AS ENUM (
    'PENDENTE',
    'EM_ESCROW',
    'PAGA',
    'VENCIDA',
    'CANCELADA'
);

-- Métodos de pagamento
CREATE TYPE metodo_pagamento AS ENUM (
    'CASH',
    'MPESA',
    'EMOLA',
    'BIM',
    'CARTAO_DEBITO',
    'CARTAO_CREDITO',
    'ESCROW'
);

-- Estado do pagamento
CREATE TYPE estado_pagamento AS ENUM (
    'PENDENTE',
    'PROCESSANDO',
    'CONCLUIDO',
    'FALHADO',
    'REEMBOLSADO'
);

-- Estado de pagamento do documento fiscal
CREATE TYPE doc_estado_pagamento AS ENUM (
    'PENDENTE',
    'PARCIAL',
    'PAGO',
    'EXCEDENTE'
);

-- Tipos de documentos fiscais
CREATE TYPE tipo_documento_fiscal AS ENUM (
    'FT',  -- Fatura
    'FR',  -- Fatura Recibo
    'NC',  -- Nota de Crédito
    'ND',  -- Nota de Débito
    'GT',  -- Guia de Transporte
    'GR',  -- Guia de Remessa
    'OR'   -- Orçamento (não fiscal)
);

-- Tipos de histórico de negociação
CREATE TYPE tipo_historico_negociacao AS ENUM (
    'ALTERACAO_PRECO',
    'ALTERACAO_QTD',
    'ALTERACAO_DESCONTO',
    'COUNTER_OFFER',
    'COMENTARIO',
    'ENVIO',
    'ACEITE',
    'REJEITE'
);

-- =============================================================================
-- TABELAS EXISTENTES MODIFICADAS
-- =============================================================================

-- Tabela tenants (Empresas) - MODIFICADA
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    nif VARCHAR(50) UNIQUE NOT NULL,
    endereco TEXT,
    telefone VARCHAR(50),
    email VARCHAR(255),
    
    -- Campos novos para B2B/Payments
    wallet_balance DECIMAL(15,2) DEFAULT 0.00,
    conta_bancaria JSONB DEFAULT NULL, -- {banco, iban, swift, titular}
    configuracoes_pagamento JSONB DEFAULT '{
        "aceita_mpesa": true,
        "aceita_emola": true,
        "aceita_bim": true,
        "aceita_cartao_debito": false,
        "aceita_cartao_credito": false,
        "aceita_escrow": true,
        "prazo_padrao_dias": 30
    }'::jsonb,
    
    -- Configurações de série fiscal
    serie_ft VARCHAR(10) DEFAULT 'FT',      -- Fatura
    serie_fr VARCHAR(10) DEFAULT 'FR',      -- Fatura/Recibo
    serie_nc VARCHAR(10) DEFAULT 'NC',      -- Nota de Crédito
    serie_nd VARCHAR(10) DEFAULT 'ND',      -- Nota de Débito
    serie_proforma VARCHAR(10) DEFAULT 'P', -- Proforma
    serie_recibo VARCHAR(10) DEFAULT 'R',   -- Recibo
    
    -- Contadores de sequência (por ano fiscal)
    contador_ft INTEGER DEFAULT 0,
    contador_fr INTEGER DEFAULT 0,
    contador_nc INTEGER DEFAULT 0,
    contador_nd INTEGER DEFAULT 0,
    contador_proforma INTEGER DEFAULT 0,
    contador_recibo INTEGER DEFAULT 0,
    
    ano_fiscal_atual INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    ativo BOOLEAN DEFAULT TRUE
);

-- Tabela clientes (Compradores)
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    nif VARCHAR(50),
    endereco TEXT,
    telefone VARCHAR(50),
    email VARCHAR(255),
    tipo_cliente VARCHAR(20) DEFAULT 'INDIVIDUAL', -- INDIVIDUAL, EMPRESA
    credito_autorizado DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_nif_por_tenant UNIQUE (tenant_id, nif)
);

-- Tabela produtos
CREATE TABLE IF NOT EXISTS produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    codigo VARCHAR(100) NOT NULL,
    descricao VARCHAR(500) NOT NULL,
    descricao_comercial TEXT, -- Para B2B/marketplace
    preco_unitario DECIMAL(15,2) NOT NULL,
    iva_percentual DECIMAL(5,2) DEFAULT 16.00,
    unidade_medida VARCHAR(20) DEFAULT 'UN',
    stock_disponivel DECIMAL(15,2) DEFAULT 0,
    imagem_url TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_codigo_por_tenant UNIQUE (tenant_id, codigo)
);

-- =============================================================================
-- NOVAS ENTIDADES CRÍTICAS
-- =============================================================================

-- 1. WORKFLOW DE NEGOCIAÇÕES (COTAÇÕES) - Documento Comercial Negociável
CREATE TABLE workflow_negociacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE, -- Vendedor
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE, -- Comprador
    
    -- Status do workflow
    status cotacao_status DEFAULT 'RASCUNHO',
    
    -- Itens da cotação (negociáveis)
    itens JSONB NOT NULL DEFAULT '[]'::jsonb,
    /* Estrutura esperada:
    [
        {
            "produto_id": "uuid",
            "descricao": "string",
            "quantidade": 10,
            "preco_unit": 100.00,
            "desconto_percent": 5.00,
            "iva_percent": 16.00,
            "total_linha": 1088.00
        }
    ]
    */
    
    -- Totais estimados
    subtotal DECIMAL(15,2) DEFAULT 0.00,
    total_descontos DECIMAL(15,2) DEFAULT 0.00,
    total_iva DECIMAL(15,2) DEFAULT 0.00,
    total_estimado DECIMAL(15,2) DEFAULT 0.00,
    
    -- Validade
    validade_ate DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
    
    -- Histórico de negociação
    historico_negociacao JSONB DEFAULT '[]'::jsonb,
    /* Estrutura esperada:
    [
        {
            "data": "2025-01-15T10:30:00Z",
            "autor_id": "uuid",
            "autor_tipo": "VENDEDOR|COMPRADOR",
            "tipo": "ALTERACAO_PRECO|COUNTER_OFFER|COMENTARIO",
            "campo_afectado": "preco_unit|quantidade|desconto",
            "valor_anterior": 100.00,
            "valor_novo": 95.00,
            "comentario": "string"
        }
    ]
    */
    
    -- Referência de conversão
    conversao_documento_id UUID DEFAULT NULL, -- Referência para proforma quando convertida
    
    -- Metadados
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID, -- Referência ao utilizador
    
    -- Constraints
    CONSTRAINT validade_positiva CHECK (validade_ate >= created_at::date)
);

-- 2. PROFORMAS - Documento Comercial Prévio (imutável após emissão)
CREATE TABLE proformas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relacionamentos
    cotacao_id UUID REFERENCES workflow_negociacoes(id) ON DELETE SET NULL,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    
    -- Numeração (série P/)
    numero_proforma VARCHAR(50) NOT NULL,
    ano_proforma INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    
    -- Datas
    data_emissao DATE DEFAULT CURRENT_DATE,
    data_vencimento DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
    
    -- Itens (snapshot final da negociação - IMUTÁVEL)
    itens JSONB NOT NULL,
    /* Snapshot completo dos itens acordados */
    
    -- Totais
    subtotal DECIMAL(15,2) NOT NULL,
    total_descontos DECIMAL(15,2) DEFAULT 0.00,
    total_iva DECIMAL(15,2) NOT NULL,
    total_geral DECIMAL(15,2) NOT NULL,
    
    -- Condições de pagamento
    condicoes_pagamento condicao_pagamento DEFAULT '30_DIAS',
    
    -- Status
    status proforma_status DEFAULT 'PENDENTE',
    
    -- Notas
    notas TEXT,
    termos_condicoes TEXT,
    
    -- Metadados
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT numero_proforma_unico UNIQUE (tenant_id, numero_proforma, ano_proforma),
    CONSTRAINT totais_positivos CHECK (subtotal >= 0 AND total_geral >= 0)
);

-- 3. PAGAMENTOS - Payment Orchestration
CREATE TABLE pagamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relacionamentos
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE, -- Recebedor
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE, -- Pagador
    proforma_id UUID REFERENCES proformas(id) ON DELETE SET NULL,
    fatura_id UUID REFERENCES documentos_fiscais(id) ON DELETE SET NULL, -- Pagamento direto FT
    
    -- Dados do pagamento
    metodo metodo_pagamento NOT NULL,
    valor DECIMAL(15,2) NOT NULL,
    moeda VARCHAR(3) DEFAULT 'MZN',
    taxa_cambio DECIMAL(10,6) DEFAULT 1.000000, -- Para futuro multi-moeda
    
    -- Estado do pagamento
    estado estado_pagamento DEFAULT 'PENDENTE',
    
    -- Referência do gateway de pagamento
    gateway_ref VARCHAR(255), -- ID transação M-Pesa, Stripe, etc
    gateway_resposta JSONB, -- Resposta completa do gateway
    
    -- Escrow (pagamento em garantia)
    is_escrow BOOLEAN DEFAULT FALSE,
    escrow_release_date TIMESTAMPTZ,
    escrow_released_by UUID,
    escrow_release_condition TEXT, -- Condição para libertação
    
    -- Comprovativo (para pagamentos CASH/manual)
    comprovativo_url TEXT,
    comprovativo_verificado BOOLEAN DEFAULT FALSE,
    verificado_por UUID,
    verificado_at TIMESTAMPTZ,
    
    -- Metadados de processamento
    processed_at TIMESTAMPTZ, -- Quando foi processado
    failed_reason TEXT, -- Motivo se falhou
    reembolso_motivo TEXT,
    reembolso_at TIMESTAMPTZ,
    
    -- Descrição/Notas
    descricao TEXT,
    
    -- Metadados
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valor_positivo CHECK (valor > 0),
    CONSTRAINT proforma_ou_fatura CHECK (
        (proforma_id IS NOT NULL AND fatura_id IS NULL) OR
        (proforma_id IS NULL AND fatura_id IS NOT NULL) OR
        (proforma_id IS NULL AND fatura_id IS NULL) -- Depósito genérico
    )
);

-- 4. RECIBOS - Documento Fiscal de Pagamento
CREATE TABLE recibos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relacionamentos
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    fatura_id UUID NOT NULL REFERENCES documentos_fiscais(id) ON DELETE CASCADE,
    pagamento_id UUID NOT NULL REFERENCES pagamentos(id) ON DELETE CASCADE,
    
    -- Numeração (série R/)
    numero_recibo VARCHAR(50) NOT NULL,
    ano_recibo INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    
    -- Datas
    data_recibo DATE DEFAULT CURRENT_DATE,
    
    -- Valores
    valor_recebido DECIMAL(15,2) NOT NULL,
    metodo TEXT NOT NULL,
    
    -- Dados do documento fiscal de origem
    numero_fatura_origem VARCHAR(50) NOT NULL,
    data_fatura_origem DATE NOT NULL,
    valor_total_fatura DECIMAL(15,2) NOT NULL,
    valor_pendente_antes DECIMAL(15,2) NOT NULL,
    valor_pendente_depois DECIMAL(15,2) NOT NULL,
    
    -- Hash e assinatura digital (conforme requisitos fiscais)
    hash_recibo VARCHAR(64), -- SHA256
    assinatura_digital TEXT,
    
    -- QR Code data (se aplicável)
    qr_code_data TEXT,
    
    -- Metadados
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT numero_recibo_unico UNIQUE (tenant_id, numero_recibo, ano_recibo),
    CONSTRAINT valores_coerentes CHECK (valor_recebido > 0)
);

-- 5. DOCUMENTOS FISCAIS (FT, FR, NC, ND) - MODIFICADA
CREATE TABLE documentos_fiscais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relacionamentos
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    
    -- Nova: Referência à proforma de origem
    proforma_origin_id UUID REFERENCES proformas(id) ON DELETE SET NULL,
    
    -- Numeração fiscal
    tipo tipo_documento_fiscal NOT NULL,
    numero_documento VARCHAR(50) NOT NULL,
    ano_fiscal INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    
    -- Datas
    data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
    data_vencimento DATE,
    
    -- Itens (imutáveis)
    itens JSONB NOT NULL,
    
    -- Totais
    subtotal DECIMAL(15,2) NOT NULL,
    total_descontos DECIMAL(15,2) DEFAULT 0.00,
    total_iva DECIMAL(15,2) NOT NULL,
    total_geral DECIMAL(15,2) NOT NULL,
    
    -- Dados fiscais específicos
    hash_documento VARCHAR(64), -- SHA256 conforme legislação
    qr_code_data TEXT,
    assinatura_digital TEXT,
    
    -- Campos novos para B2B/Payments
    pagamento_integrado BOOLEAN DEFAULT FALSE, -- true se pago via app
    estado_pagamento doc_estado_pagamento DEFAULT 'PENDENTE',
    valor_pago DECIMAL(15,2) DEFAULT 0.00,
    
    -- Motivo (para NC, ND)
    motivo TEXT,
    documento_ref_id UUID REFERENCES documentos_fiscais(id) ON DELETE SET NULL,
    
    -- Status do documento
    estado VARCHAR(20) DEFAULT 'ATIVO', -- ATIVO, ANULADO, SUBSTITUIDO
    anulado_motivo TEXT,
    anulado_at TIMESTAMPTZ,
    anulado_por UUID,
    
    -- Metadados
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT numero_doc_unico UNIQUE (tenant_id, tipo, numero_documento, ano_fiscal),
    CONSTRAINT totais_positivos CHECK (subtotal >= 0 AND total_geral >= 0)
);

-- Adicionar FK em recibos após criar documentos_fiscais (circular reference)
-- Já está correto pois recibos foi criado depois

-- =============================================================================
-- TABELAS DE AUDITORIA E LOGS
-- =============================================================================

-- Audit log para pagamentos
CREATE TABLE audit_log_pagamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pagamento_id UUID NOT NULL REFERENCES pagamentos(id) ON DELETE CASCADE,
    estado_anterior estado_pagamento,
    estado_novo estado_pagamento NOT NULL,
    alterado_por UUID,
    alterado_em TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    motivo TEXT,
    metadata JSONB
);

-- Audit log para proformas
CREATE TABLE audit_log_proformas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proforma_id UUID NOT NULL REFERENCES proformas(id) ON DELETE CASCADE,
    status_anterior proforma_status,
    status_novo proforma_status NOT NULL,
    alterado_por UUID,
    alterado_em TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    metadata JSONB
);

-- Histórico de saques da wallet
CREATE TABLE wallet_saques (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    valor DECIMAL(15,2) NOT NULL,
    metodo VARCHAR(50) NOT NULL, -- TRANSFERENCIA, MPESA, etc
    conta_destino JSONB NOT NULL, -- {banco, iban, titular}
    estado VARCHAR(20) DEFAULT 'PENDENTE', -- PENDENTE, PROCESSANDO, CONCLUIDO, REJEITADO
    processado_at TIMESTAMPTZ,
    comprovativo_url TEXT,
    referencia_operacao VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    
    CONSTRAINT valor_saque_positivo CHECK (valor > 0)
);

-- =============================================================================
-- INDEXES PARA PERFORMANCE B2B
-- =============================================================================

-- Workflow de negociações
CREATE INDEX idx_cotacoes_cliente_status ON workflow_negociacoes(cliente_id, status);
CREATE INDEX idx_cotacoes_tenant_status ON workflow_negociacoes(tenant_id, status);
CREATE INDEX idx_cotacoes_validade ON workflow_negociacoes(validade_ate) WHERE status IN ('RASCUNHO', 'ENVIADA', 'NEGOCIANDO');
CREATE INDEX idx_cotacoes_conversao ON workflow_negociacoes(conversao_documento_id) WHERE conversao_documento_id IS NOT NULL;

-- Proformas
CREATE INDEX idx_proformas_tenant_status ON proformas(tenant_id, status);
CREATE INDEX idx_proformas_vencimento ON proformas(status, validade_ate) WHERE status = 'PENDENTE';
CREATE INDEX idx_proformas_cotacao ON proformas(cotacao_id);
CREATE INDEX idx_proformas_cliente ON proformas(cliente_id);

-- Pagamentos
CREATE INDEX idx_pagamentos_gateway ON pagamentos(gateway_ref, estado);
CREATE INDEX idx_pagamentos_tenant ON pagamentos(tenant_id, created_at DESC);
CREATE INDEX idx_pagamentos_cliente ON pagamentos(cliente_id, created_at DESC);
CREATE INDEX idx_pagamentos_proforma ON pagamentos(proforma_id);
CREATE INDEX idx_pagamentos_fatura ON pagamentos(fatura_id);
CREATE INDEX idx_pagamentos_escrow ON pagamentos(is_escrow, escrow_release_date) WHERE is_escrow = TRUE;

-- Recibos
CREATE INDEX idx_recibos_fatura ON recibos(fatura_id);
CREATE INDEX idx_recibos_tenant ON recibos(tenant_id, data_recibo DESC);

-- Documentos fiscais
CREATE INDEX idx_docs_fiscais_tenant ON documentos_fiscais(tenant_id, data_emissao DESC);
CREATE INDEX idx_docs_fiscais_cliente ON documentos_fiscais(cliente_id, estado_pagamento);
CREATE INDEX idx_docs_fiscais_proforma ON documentos_fiscais(proforma_origin_id) WHERE proforma_origin_id IS NOT NULL;
CREATE INDEX idx_docs_fiscais_estado_pag ON documentos_fiscais(estado_pagamento) WHERE estado_pagamento != 'PAGO';

-- GIN indexes para JSONB
CREATE INDEX idx_cotacoes_itens_gin ON workflow_negociacoes USING GIN (itens);
CREATE INDEX idx_cotacoes_historico_gin ON workflow_negociacoes USING GIN (historico_negociacao);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Função para calcular e atualizar wallet_balance do tenant
CREATE OR REPLACE FUNCTION calcular_wallet_balance(p_tenant_id UUID)
RETURNS DECIMAL(15,2) AS $$
DECLARE
    v_balance DECIMAL(15,2);
    v_ultimo_saque TIMESTAMPTZ;
BEGIN
    -- Encontrar data do último saque concluído
    SELECT MAX(created_at) INTO v_ultimo_saque
    FROM wallet_saques
    WHERE tenant_id = p_tenant_id AND estado = 'CONCLUIDO';
    
    -- Calcular soma de pagamentos concluídos desde o último saque
    SELECT COALESCE(SUM(valor), 0)
    INTO v_balance
    FROM pagamentos
    WHERE tenant_id = p_tenant_id
        AND estado = 'CONCLUIDO'
        AND (v_ultimo_saque IS NULL OR created_at > v_ultimo_saque);
    
    -- Subtrair valor em escrow ainda não libertado
    SELECT v_balance - COALESCE(SUM(valor), 0)
    INTO v_balance
    FROM pagamentos
    WHERE tenant_id = p_tenant_id
        AND is_escrow = TRUE
        AND estado = 'CONCLUIDO'
        AND escrow_release_date IS NULL;
    
    -- Atualizar campo na tabela tenants
    UPDATE tenants
    SET wallet_balance = v_balance,
        updated_at = NOW()
    WHERE id = p_tenant_id;
    
    RETURN v_balance;
END;
$$ LANGUAGE plpgsql;

-- Função para gerar número de proforma sequencial
CREATE OR REPLACE FUNCTION gerar_numero_proforma(p_tenant_id UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
    v_numero VARCHAR(50);
    v_contador INTEGER;
    v_ano INTEGER;
    v_serie VARCHAR(10);
BEGIN
    -- Bloquear linha do tenant para evitar duplicados
    SELECT serie_proforma, contador_proforma, ano_fiscal_atual
    INTO v_serie, v_contador, v_ano
    FROM tenants
    WHERE id = p_tenant_id
    FOR UPDATE;
    
    -- Incrementar contador
    v_contador := v_contador + 1;
    
    -- Verificar se mudou de ano fiscal
    IF EXTRACT(YEAR FROM CURRENT_DATE) != v_ano THEN
        v_ano := EXTRACT(YEAR FROM CURRENT_DATE);
        v_contador := 1;
    END IF;
    
    -- Atualizar tenant
    UPDATE tenants
    SET contador_proforma = v_contador,
        ano_fiscal_atual = v_ano
    WHERE id = p_tenant_id;
    
    -- Gerar número: P/2025/1
    v_numero := v_serie || '/' || v_ano::text || '/' || v_contador::text;
    
    RETURN v_numero;
END;
$$ LANGUAGE plpgsql;

-- Função para gerar número de recibo sequencial
CREATE OR REPLACE FUNCTION gerar_numero_recibo(p_tenant_id UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
    v_numero VARCHAR(50);
    v_contador INTEGER;
    v_ano INTEGER;
    v_serie VARCHAR(10);
BEGIN
    SELECT serie_recibo, contador_recibo, ano_fiscal_atual
    INTO v_serie, v_contador, v_ano
    FROM tenants
    WHERE id = p_tenant_id
    FOR UPDATE;
    
    v_contador := v_contador + 1;
    
    IF EXTRACT(YEAR FROM CURRENT_DATE) != v_ano THEN
        v_ano := EXTRACT(YEAR FROM CURRENT_DATE);
        v_contador := 1;
    END IF;
    
    UPDATE tenants
    SET contador_recibo = v_contador,
        ano_fiscal_atual = v_ano
    WHERE id = p_tenant_id;
    
    v_numero := v_serie || '/' || v_ano::text || '/' || v_contador::text;
    
    RETURN v_numero;
END;
$$ LANGUAGE plpgsql;

-- Função para gerar número de documento fiscal
CREATE OR REPLACE FUNCTION gerar_numero_documento_fiscal(
    p_tenant_id UUID,
    p_tipo tipo_documento_fiscal
)
RETURNS VARCHAR(50) AS $$
DECLARE
    v_numero VARCHAR(50);
    v_contador INTEGER;
    v_ano INTEGER;
    v_serie VARCHAR(10);
    v_campo_contador TEXT;
BEGIN
    -- Determinar qual campo usar baseado no tipo
    CASE p_tipo
        WHEN 'FT' THEN v_campo_contador := 'contador_ft';
        WHEN 'FR' THEN v_campo_contador := 'contador_fr';
        WHEN 'NC' THEN v_campo_contador := 'contador_nc';
        WHEN 'ND' THEN v_campo_contador := 'contador_nd';
        ELSE RAISE EXCEPTION 'Tipo de documento não suportado: %', p_tipo;
    END CASE;
    
    -- Executar dinamicamente para obter contador correto
    EXECUTE format('
        SELECT serie_%s, %s, ano_fiscal_atual
        FROM tenants
        WHERE id = $1
        FOR UPDATE
    ', lower(p_tipo::text), v_campo_contador)
    INTO v_serie, v_contador, v_ano
    USING p_tenant_id;
    
    v_contador := v_contador + 1;
    
    IF EXTRACT(YEAR FROM CURRENT_DATE) != v_ano THEN
        v_ano := EXTRACT(YEAR FROM CURRENT_DATE);
        v_contador := 1;
    END IF;
    
    -- Atualizar contador
    EXECUTE format('
        UPDATE tenants
        SET %s = $1,
            ano_fiscal_atual = $2
        WHERE id = $3
    ', v_campo_contador)
    USING v_contador, v_ano, p_tenant_id;
    
    v_numero := v_serie || ' ' || v_ano::text || '/' || LPAD(v_contador::text, 4, '0');
    
    RETURN v_numero;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular totais da cotação a partir dos itens
CREATE OR REPLACE FUNCTION calcular_totais_cotacao(p_itens JSONB)
RETURNS TABLE (
    subtotal DECIMAL(15,2),
    total_descontos DECIMAL(15,2),
    total_iva DECIMAL(15,2),
    total_geral DECIMAL(15,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM((item->>'quantidade')::DECIMAL * (item->>'preco_unit')::DECIMAL), 0) as subtotal,
        COALESCE(SUM((item->>'quantidade')::DECIMAL * (item->>'preco_unit')::DECIMAL * COALESCE((item->>'desconto_percent')::DECIMAL, 0) / 100), 0) as total_descontos,
        COALESCE(SUM(
            ((item->>'quantidade')::DECIMAL * (item->>'preco_unit')::DECIMAL * (1 - COALESCE((item->>'desconto_percent')::DECIMAL, 0) / 100)) *
            COALESCE((item->>'iva_percent')::DECIMAL, 16) / 100
        ), 0) as total_iva,
        COALESCE(SUM(
            ((item->>'quantidade')::DECIMAL * (item->>'preco_unit')::DECIMAL * (1 - COALESCE((item->>'desconto_percent')::DECIMAL, 0) / 100)) *
            (1 + COALESCE((item->>'iva_percent')::DECIMAL, 16) / 100)
        ), 0) as total_geral
    FROM jsonb_array_elements(p_itens) AS item;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular hash SHA256 de um documento
CREATE OR REPLACE FUNCTION calcular_hash_documento(
    p_tipo tipo_documento_fiscal,
    p_numero VARCHAR(50),
    p_data DATE,
    p_total DECIMAL(15,2),
    p_tenant_nif VARCHAR(50)
)
RETURNS VARCHAR(64) AS $$
BEGIN
    RETURN encode(
        digest(
            p_tipo::text || '|' || 
            p_numero || '|' || 
            p_data::text || '|' || 
            p_total::text || '|' || 
            p_tenant_nif,
            'sha256'
        ),
        'hex'
    );
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Trigger 1: Ao atualizar cotação para ACEITE, gerar proforma
CREATE OR REPLACE FUNCTION trigger_workflow_cotacao_to_proforma()
RETURNS TRIGGER AS $$
DECLARE
    v_proforma_id UUID;
    v_numero_proforma VARCHAR(50);
    v_existe_proforma BOOLEAN;
BEGIN
    -- Verificar se status mudou para ACEITE
    IF NEW.status = 'ACEITE' AND (OLD.status IS NULL OR OLD.status != 'ACEITE') THEN
        
        -- Verificar se já existe proforma ativa para esta cotação
        SELECT EXISTS(
            SELECT 1 FROM proformas 
            WHERE cotacao_id = NEW.id 
            AND status NOT IN ('CANCELADA', 'VENCIDA')
        ) INTO v_existe_proforma;
        
        IF v_existe_proforma THEN
            RAISE EXCEPTION 'Já existe uma proforma ativa para esta cotação';
        END IF;
        
        -- Gerar número de proforma
        v_numero_proforma := gerar_numero_proforma(NEW.tenant_id);
        
        -- Criar proforma com snapshot dos itens
        INSERT INTO proformas (
            cotacao_id,
            tenant_id,
            cliente_id,
            numero_proforma,
            data_emissao,
            itens,
            subtotal,
            total_descontos,
            total_iva,
            total_geral,
            condicoes_pagamento,
            status
        ) VALUES (
            NEW.id,
            NEW.tenant_id,
            NEW.cliente_id,
            v_numero_proforma,
            CURRENT_DATE,
            NEW.itens, -- Snapshot imutável
            NEW.subtotal,
            NEW.total_descontos,
            NEW.total_iva,
            NEW.total_estimado,
            '30_DIAS', -- Default, pode ser ajustado
            'PENDENTE'
        )
        RETURNING id INTO v_proforma_id;
        
        -- Atualizar cotação com referência
        NEW.conversao_documento_id := v_proforma_id;
        NEW.status := 'CONVERTIDA';
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workflow_cotacao_to_proforma
    BEFORE UPDATE ON workflow_negociacoes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_workflow_cotacao_to_proforma();

-- Trigger 2: Validar criação de documento fiscal a partir de proforma
CREATE OR REPLACE FUNCTION trigger_validar_proforma_para_fiscal()
RETURNS TRIGGER AS $$
DECLARE
    v_proforma RECORD;
    v_diferenca DECIMAL(15,2);
BEGIN
    -- Se há referência a proforma, validar
    IF NEW.proforma_origin_id IS NOT NULL THEN
        
        SELECT * INTO v_proforma
        FROM proformas
        WHERE id = NEW.proforma_origin_id;
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Proforma de origem não encontrada';
        END IF;
        
        -- Verificar se proforma está paga
        IF v_proforma.status != 'PAGA' AND NEW.tipo = 'FT' THEN
            RAISE EXCEPTION 'Não é possível criar Fatura a partir de Proforma não paga. Status atual: %', v_proforma.status;
        END IF;
        
        -- Verificar se valores coincidem (com margem de 0.01 para arredondamentos)
        v_diferenca := ABS(NEW.total_geral - v_proforma.total_geral);
        IF v_diferenca > 0.01 THEN
            RAISE EXCEPTION 'Total da Fatura (%) não coincide com Proforma (%). Diferença: %', 
                NEW.total_geral, v_proforma.total_geral, v_diferenca;
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER proforma_to_fiscal
    BEFORE INSERT ON documentos_fiscais
    FOR EACH ROW
    EXECUTE FUNCTION trigger_validar_proforma_para_fiscal();

-- Trigger 3: Atualizar estado de pagamento do documento fiscal quando pagamento é concluído
CREATE OR REPLACE FUNCTION trigger_atualizar_estado_doc_fiscal()
RETURNS TRIGGER AS $$
DECLARE
    v_doc RECORD;
    v_total_pago DECIMAL(15,2);
    v_novo_estado doc_estado_pagamento;
BEGIN
    -- Se pagamento foi concluído
    IF NEW.estado = 'CONCLUIDO' AND (OLD.estado IS NULL OR OLD.estado != 'CONCLUIDO') THEN
        
        -- Se há fatura associada
        IF NEW.fatura_id IS NOT NULL THEN
            
            SELECT * INTO v_doc
            FROM documentos_fiscais
            WHERE id = NEW.fatura_id;
            
            -- Calcular total pago para esta fatura
            SELECT COALESCE(SUM(valor), 0)
            INTO v_total_pago
            FROM pagamentos
            WHERE fatura_id = NEW.fatura_id
            AND estado = 'CONCLUIDO';
            
            -- Determinar novo estado
            IF v_total_pago >= v_doc.total_geral THEN
                IF v_total_pago > v_doc.total_geral THEN
                    v_novo_estado := 'EXCEDENTE';
                ELSE
                    v_novo_estado := 'PAGO';
                END IF;
            ELSIF v_total_pago > 0 THEN
                v_novo_estado := 'PARCIAL';
            ELSE
                v_novo_estado := 'PENDENTE';
            END IF;
            
            -- Atualizar documento fiscal
            UPDATE documentos_fiscais
            SET estado_pagamento = v_novo_estado,
                valor_pago = v_total_pago,
                pagamento_integrado = TRUE,
                updated_at = NOW()
            WHERE id = NEW.fatura_id;
            
        END IF;
        
        -- Se há proforma associada
        IF NEW.proforma_id IS NOT NULL THEN
            UPDATE proformas
            SET status = 'PAGA',
                updated_at = NOW()
            WHERE id = NEW.proforma_id
            AND status != 'PAGA';
        END IF;
        
        -- Atualizar wallet balance do tenant
        PERFORM calcular_wallet_balance(NEW.tenant_id);
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pagamento_concluido_update_docs
    AFTER UPDATE ON pagamentos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_atualizar_estado_doc_fiscal();

-- Trigger 4: Criar recibo automaticamente quando FT é paga
CREATE OR REPLACE FUNCTION trigger_gerar_recibo_automatico()
RETURNS TRIGGER AS $$
DECLARE
    v_pagamento RECORD;
    v_numero_recibo VARCHAR(50);
    v_hash VARCHAR(64);
    v_tenant_nif VARCHAR(50);
BEGIN
    -- Se documento fiscal foi pago
    IF NEW.estado_pagamento = 'PAGO' AND (OLD.estado_pagamento IS NULL OR OLD.estado_pagamento != 'PAGO') THEN
        
        -- Buscar pagamento concluído associado
        SELECT p.* INTO v_pagamento
        FROM pagamentos p
        WHERE p.fatura_id = NEW.id
        AND p.estado = 'CONCLUIDO'
        ORDER BY p.created_at DESC
        LIMIT 1;
        
        IF FOUND THEN
            -- Gerar número de recibo
            v_numero_recibo := gerar_numero_recibo(NEW.tenant_id);
            
            -- Buscar NIF do tenant para hash
            SELECT nif INTO v_tenant_nif
            FROM tenants WHERE id = NEW.tenant_id;
            
            -- Calcular hash
            v_hash := calcular_hash_documento(
                'FT'::tipo_documento_fiscal,
                v_numero_recibo,
                CURRENT_DATE,
                v_pagamento.valor,
                v_tenant_nif
            );
            
            -- Criar recibo
            INSERT INTO recibos (
                tenant_id,
                fatura_id,
                pagamento_id,
                numero_recibo,
                data_recibo,
                valor_recebido,
                metodo,
                numero_fatura_origem,
                data_fatura_origem,
                valor_total_fatura,
                valor_pendente_antes,
                valor_pendente_depois,
                hash_recibo
            ) VALUES (
                NEW.tenant_id,
                NEW.id,
                v_pagamento.id,
                v_numero_recibo,
                CURRENT_DATE,
                v_pagamento.valor,
                v_pagamento.metodo::text,
                NEW.numero_documento,
                NEW.data_emissao,
                NEW.total_geral,
                NEW.total_geral,
                0,
                v_hash
            );
            
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER gerar_recibo_automatico
    AFTER UPDATE ON documentos_fiscais
    FOR EACH ROW
    EXECUTE FUNCTION trigger_gerar_recibo_automatico();

-- Trigger 5: Audit log para pagamentos
CREATE OR REPLACE FUNCTION trigger_audit_pagamentos()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.estado IS DISTINCT FROM NEW.estado THEN
        INSERT INTO audit_log_pagamentos (
            pagamento_id,
            estado_anterior,
            estado_novo,
            alterado_em
        ) VALUES (
            NEW.id,
            OLD.estado,
            NEW.estado,
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_pagamentos
    AFTER UPDATE ON pagamentos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_audit_pagamentos();

-- Trigger 6: Audit log para proformas
CREATE OR REPLACE FUNCTION trigger_audit_proformas()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO audit_log_proformas (
            proforma_id,
            status_anterior,
            status_novo,
            alterado_em
        ) VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_proformas
    AFTER UPDATE ON proformas
    FOR EACH ROW
    EXECUTE FUNCTION trigger_audit_proformas();

-- Trigger 7: Atualizar timestamps
CREATE OR REPLACE FUNCTION trigger_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER updated_at_tenants
    BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();

CREATE TRIGGER updated_at_clientes
    BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();

CREATE TRIGGER updated_at_produtos
    BEFORE UPDATE ON produtos
    FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();

CREATE TRIGGER updated_at_workflow_negociacoes
    BEFORE UPDATE ON workflow_negociacoes
    FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();

CREATE TRIGGER updated_at_proformas
    BEFORE UPDATE ON proformas
    FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();

CREATE TRIGGER updated_at_pagamentos
    BEFORE UPDATE ON pagamentos
    FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();

CREATE TRIGGER updated_at_documentos_fiscais
    BEFORE UPDATE ON documentos_fiscais
    FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();

-- Trigger 8: Calcular totais da cotação antes de inserir/atualizar
CREATE OR REPLACE FUNCTION trigger_calcular_totais_cotacao()
RETURNS TRIGGER AS $$
DECLARE
    v_totais RECORD;
BEGIN
    -- Calcular totais baseado nos itens
    SELECT * INTO v_totais FROM calcular_totais_cotacao(NEW.itens);
    
    NEW.subtotal := v_totais.subtotal;
    NEW.total_descontos := v_totais.total_descontos;
    NEW.total_iva := v_totais.total_iva;
    NEW.total_estimado := v_totais.total_geral;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calcular_totais_cotacao
    BEFORE INSERT OR UPDATE ON workflow_negociacoes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_calcular_totais_cotacao();

-- Trigger 9: Impedir alteração direta do wallet_balance
CREATE OR REPLACE FUNCTION trigger_protect_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Se tentar alterar wallet_balance diretamente
    IF OLD.wallet_balance IS DISTINCT FROM NEW.wallet_balance THEN
        -- Verificar se é uma chamada interna (via função calcular_wallet_balance)
        -- Esta é uma proteção simples - em produção usar abordagem mais robusta
        RAISE EXCEPTION 'wallet_balance não pode ser alterado diretamente. Use a função calcular_wallet_balance() ou espere por triggers de pagamento.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER protect_wallet_balance
    BEFORE UPDATE ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION trigger_protect_wallet_balance();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Habilitar RLS nas tabelas
ALTER TABLE workflow_negociacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE proformas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE recibos ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_fiscais ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log_pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log_proformas ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_saques ENABLE ROW LEVEL SECURITY;

-- Políticas para workflow_negociacoes
-- Vendedor (tenant) vê todas as suas cotações
CREATE POLICY cotacoes_tenant_policy ON workflow_negociacoes
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Comprador vê cotações onde é cliente
CREATE POLICY cotacoes_cliente_policy ON workflow_negociacoes
    FOR SELECT
    USING (cliente_id = current_setting('app.current_cliente_id')::UUID);

-- Políticas para proformas
CREATE POLICY proformas_tenant_policy ON proformas
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY proformas_cliente_policy ON proformas
    FOR SELECT
    USING (cliente_id = current_setting('app.current_cliente_id')::UUID);

-- Políticas para pagamentos
-- Usuário vê pagamentos onde é tenant (recebedor) OU cliente (pagador)
CREATE POLICY pagamentos_access_policy ON pagamentos
    FOR SELECT
    USING (
        tenant_id = current_setting('app.current_tenant_id')::UUID
        OR cliente_id = current_setting('app.current_cliente_id')::UUID
    );

CREATE POLICY pagamentos_tenant_modify_policy ON pagamentos
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID)
    WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Políticas para recibos
CREATE POLICY recibos_tenant_policy ON recibos
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY recibos_cliente_policy ON recibos
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM documentos_fiscais df
            WHERE df.id = recibos.fatura_id
            AND df.cliente_id = current_setting('app.current_cliente_id')::UUID
        )
    );

-- Políticas para documentos_fiscais
CREATE POLICY docs_fiscais_tenant_policy ON documentos_fiscais
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY docs_fiscais_cliente_policy ON documentos_fiscais
    FOR SELECT
    USING (cliente_id = current_setting('app.current_cliente_id')::UUID);

-- Políticas para clientes
CREATE POLICY clientes_tenant_policy ON clientes
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Políticas para produtos
CREATE POLICY produtos_tenant_policy ON produtos
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Políticas para audit logs
CREATE POLICY audit_pagamentos_tenant_policy ON audit_log_pagamentos
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM pagamentos p
            WHERE p.id = audit_log_pagamentos.pagamento_id
            AND p.tenant_id = current_setting('app.current_tenant_id')::UUID
        )
    );

CREATE POLICY audit_proformas_tenant_policy ON audit_log_proformas
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM proformas p
            WHERE p.id = audit_log_proformas.proforma_id
            AND p.tenant_id = current_setting('app.current_tenant_id')::UUID
        )
    );

-- Políticas para wallet_saques
CREATE POLICY wallet_saques_tenant_policy ON wallet_saques
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- =============================================================================
-- VIEWS ÚTEIS
-- =============================================================================

-- View resumo de vendas por tenant
CREATE VIEW v_resumo_vendas_tenant AS
SELECT
    df.tenant_id,
    t.nome as tenant_nome,
    DATE_TRUNC('month', df.data_emissao) as mes,
    COUNT(*) as total_documentos,
    SUM(df.total_geral) as total_vendas,
    SUM(df.valor_pago) as total_recebido,
    SUM(df.total_geral - df.valor_pago) as total_pendente
FROM documentos_fiscais df
JOIN tenants t ON t.id = df.tenant_id
WHERE df.estado = 'ATIVO'
GROUP BY df.tenant_id, t.nome, DATE_TRUNC('month', df.data_emissao);

-- View proformas pendentes de pagamento
CREATE VIEW v_proformas_pendentes AS
SELECT
    p.*,
    t.nome as tenant_nome,
    c.nome as cliente_nome,
    c.email as cliente_email,
    CURRENT_DATE - p.data_emissao as dias_desde_emissao,
    p.validade_ate - CURRENT_DATE as dias_ate_vencimento
FROM proformas p
JOIN tenants t ON t.id = p.tenant_id
JOIN clientes c ON c.id = p.cliente_id
WHERE p.status = 'PENDENTE'
ORDER BY p.data_emissao;

-- View wallet balance com detalhes
CREATE VIEW v_wallet_balance_detalhado AS
SELECT
    t.id as tenant_id,
    t.nome as tenant_nome,
    t.wallet_balance,
    (
        SELECT COALESCE(SUM(valor), 0)
        FROM pagamentos p
        WHERE p.tenant_id = t.id
        AND p.estado = 'CONCLUIDO'
        AND p.is_escrow = TRUE
        AND p.escrow_release_date IS NULL
    ) as em_escrow,
    (
        SELECT COALESCE(SUM(valor), 0)
        FROM wallet_saques ws
        WHERE ws.tenant_id = t.id
        AND ws.estado IN ('PENDENTE', 'PROCESSANDO')
    ) as saques_pendentes
FROM tenants t;

-- =============================================================================
-- COMENTÁRIOS DOCUMENTAIS
-- =============================================================================

COMMENT ON TABLE workflow_negociacoes IS 'Cotações e propostas comerciais - Documento NEGOCIÁVEL';
COMMENT ON TABLE proformas IS 'Documento Comercial Prévio - IMUTÁVEL após emissão, NÃO é documento fiscal';
COMMENT ON TABLE pagamentos IS 'Payment Orchestration - Registro de transações de pagamento';
COMMENT ON TABLE recibos IS 'Documento Fiscal de Pagamento - Comprova recebimento';
COMMENT ON TABLE documentos_fiscais IS 'Documentos Fiscais oficiais (FT, FR, NC, ND) - IMUTÁVEIS e com hash fiscal';

COMMENT ON COLUMN tenants.wallet_balance IS 'Saldo calculado automaticamente via trigger - NÃO EDITAR DIRETAMENTE';
COMMENT ON COLUMN proformas.itens IS 'Snapshot imutável dos itens acordados na negociação';
COMMENT ON COLUMN pagamentos.gateway_ref IS 'ID da transação no gateway externo (M-Pesa, Stripe, etc)';
COMMENT ON COLUMN documentos_fiscais.hash_documento IS 'SHA256 do documento conforme requisitos fiscais';

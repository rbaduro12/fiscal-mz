-- ============================================================
-- FISCAL.MZ ENTERPRISE - Schema Completo
-- Fase 0: Fundação Arquitetural
-- PostgreSQL 15+
-- ============================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. ENUMS FISCAIS (Conforme Código do IVA de Moçambique)
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'regime_iva') THEN
        CREATE TYPE regime_iva AS ENUM ('NORMAL', 'SIMPLIFICADO', 'EXCLUSIVO');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_documento') THEN
        CREATE TYPE tipo_documento AS ENUM (
            'COTACAO', 'PROFORMA', 'FACTURA', 'FACTURA_RECIBO', 
            'NOTA_CREDITO', 'NOTA_DEBITO', 'RECIBO', 'GUIA'
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_documento') THEN
        CREATE TYPE estado_documento AS ENUM (
            'RASCUNHO', 'PENDENTE', 'EMITIDA', 'ACEITE', 'REJEITADA', 
            'PAGA', 'ANULADA', 'VENCIDA'
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'metodo_pagamento') THEN
        CREATE TYPE metodo_pagamento AS ENUM (
            'CASH', 'MPESA', 'EMOLA', 'BIM', 'CARTAO', 'TRANSFERENCIA', 'CHEQUE'
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_operacao_iva') THEN
        CREATE TYPE tipo_operacao_iva AS ENUM (
            'TRIBUTAVEL_16', 'TRIBUTAVEL_10', 'TRIBUTAVEL_5', 
            'ISENTO', 'NAO_SUJEITO', 'EXPORTACAO'
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_notificacao') THEN
        CREATE TYPE tipo_notificacao AS ENUM (
            'COTACAO_RECEBIDA', 'COTACAO_ACEITE', 'COTACAO_REJEITADA', 
            'PROFORMA_EMITIDA', 'PAGAMENTO_CONFIRMADO', 'FACTURA_EMITIDA', 
            'STOCK_BAIXO', 'DOCUMENTO_VENCIDO'
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_movimento_stock') THEN
        CREATE TYPE tipo_movimento_stock AS ENUM (
            'ENTRADA', 'SAIDA', 'AJUSTE', 'DEVOLUCAO', 'INVENTARIO'
        );
    END IF;
END$$;

-- ============================================================
-- 2. TABELA: empresas (Multi-tenant)
-- ============================================================

CREATE TABLE IF NOT EXISTS empresas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nuit VARCHAR(9) UNIQUE NOT NULL CHECK (LENGTH(nuit) = 9),
    nome_fiscal VARCHAR(255) NOT NULL,
    nome_comercial VARCHAR(255),
    regime regime_iva DEFAULT 'NORMAL',
    
    -- Endereço
    endereco TEXT,
    cidade VARCHAR(100),
    provincia VARCHAR(50),
    telefone VARCHAR(20),
    email VARCHAR(255),
    
    -- Séries documentais (configuráveis)
    serie_cotacao VARCHAR(5) DEFAULT 'CQ',
    serie_proforma VARCHAR(5) DEFAULT 'PF',
    serie_factura VARCHAR(5) DEFAULT 'FT',
    serie_recibo VARCHAR(5) DEFAULT 'RC',
    serie_guia VARCHAR(5) DEFAULT 'GT',
    
    -- Contadores atômicos
    ultimo_numero_cotacao INTEGER DEFAULT 0,
    ultimo_numero_proforma INTEGER DEFAULT 0,
    ultimo_numero_factura INTEGER DEFAULT 0,
    ultimo_numero_recibo INTEGER DEFAULT 0,
    ultimo_numero_guia INTEGER DEFAULT 0,
    
    -- Crédito fiscal
    credito_iva_periodo_anterior DECIMAL(12,2) DEFAULT 0,
    
    -- Configurações comerciais
    limite_credito_padrao DECIMAL(12,2) DEFAULT 0,
    prazo_pagamento_dias INTEGER DEFAULT 30,
    
    -- Controlo
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. TABELA: utilizadores
-- ============================================================

CREATE TABLE IF NOT EXISTS utilizadores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('ADMIN', 'GESTOR', 'VENDEDOR', 'CONTABILISTA', 'CLIENTE')),
    telefone VARCHAR(20),
    ultimo_acesso TIMESTAMPTZ,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. TABELA: entidades (Clientes e Fornecedores)
-- ============================================================

CREATE TABLE IF NOT EXISTS entidades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    nuit VARCHAR(9) CHECK (LENGTH(nuit) = 9),
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(10) CHECK (tipo IN ('CLIENTE', 'FORNECEDOR', 'AMBOS')),
    
    endereco TEXT,
    cidade VARCHAR(100),
    telefone VARCHAR(20),
    email VARCHAR(255),
    
    limite_credito DECIMAL(12,2) DEFAULT 0,
    prazo_pagamento_dias INTEGER DEFAULT 30,
    saldo_em_divida DECIMAL(12,2) DEFAULT 0,
    desconto_padrao DECIMAL(5,2) DEFAULT 0 CHECK (desconto_padrao >= 0 AND desconto_padrao <= 100),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_nuit_empresa UNIQUE NULLS NOT DISTINCT (empresa_id, nuit)
);

-- ============================================================
-- 5. TABELA: artigos (Produtos e Serviços)
-- ============================================================

CREATE TABLE IF NOT EXISTS artigos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    codigo VARCHAR(50) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    tipo VARCHAR(10) CHECK (tipo IN ('PRODUTO', 'SERVICO')),
    
    preco_venda DECIMAL(10,2) NOT NULL,
    preco_custo DECIMAL(10,2),
    
    -- Stock (apenas PRODUTO)
    stock_atual INTEGER DEFAULT 0,
    stock_minimo INTEGER DEFAULT 0,
    stock_maximo INTEGER DEFAULT 0,
    localizacao VARCHAR(50),
    unidade VARCHAR(10) DEFAULT 'UN',
    
    -- Fiscal
    categoria_iva tipo_operacao_iva DEFAULT 'TRIBUTAVEL_16',
    conta_contabil VARCHAR(20),
    
    fornecedor_id UUID REFERENCES entidades(id),
    
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(empresa_id, codigo)
);

-- ============================================================
-- 6. TABELA: documentos (Workflow unificado)
-- ============================================================

CREATE TABLE IF NOT EXISTS documentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id) NOT NULL,
    entidade_id UUID REFERENCES entidades(id),
    utilizador_id UUID REFERENCES utilizadores(id),
    
    tipo tipo_documento NOT NULL,
    serie VARCHAR(5) NOT NULL DEFAULT 'TEMP',
    numero INTEGER,
    numero_completo VARCHAR(30) GENERATED ALWAYS AS (
        serie || '/' || LPAD(COALESCE(numero::TEXT, '0'), 6, '0')
    ) STORED,
    
    estado estado_documento DEFAULT 'RASCUNHO',
    documento_origem_id UUID REFERENCES documentos(id),
    
    data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
    data_vencimento DATE,
    data_pagamento TIMESTAMPTZ,
    data_validade DATE,
    
    subtotal DECIMAL(12,2) DEFAULT 0,
    total_descontos DECIMAL(12,2) DEFAULT 0,
    total_iva DECIMAL(12,2) DEFAULT 0,
    total_pagar DECIMAL(12,2) DEFAULT 0,
    
    -- Snapshot do cliente
    entidade_nome VARCHAR(255),
    entidade_nuit VARCHAR(9),
    entidade_endereco TEXT,
    
    operacao_iva tipo_operacao_iva DEFAULT 'TRIBUTAVEL_16',
    motivo_isencao VARCHAR(255),
    pais_origem VARCHAR(2),
    
    -- Segurança fiscal
    hash_fiscal VARCHAR(64),
    qr_code_data TEXT,
    codigo_validacao VARCHAR(100),
    data_registo_sistema TIMESTAMPTZ DEFAULT NOW(),
    
    -- Soft delete fiscal
    anulado BOOLEAN DEFAULT FALSE,
    motivo_anulacao TEXT,
    data_anulacao TIMESTAMPTZ,
    anulado_por UUID REFERENCES utilizadores(id),
    
    observacoes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_documento_numero UNIQUE NULLS NOT DISTINCT (empresa_id, serie, numero, tipo)
);

-- ============================================================
-- 7. TABELA: linhas_documento
-- ============================================================

CREATE TABLE IF NOT EXISTS linhas_documento (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    documento_id UUID REFERENCES documentos(id) ON DELETE CASCADE,
    artigo_id UUID REFERENCES artigos(id),
    
    codigo_artigo VARCHAR(50),
    descricao TEXT NOT NULL,
    unidade VARCHAR(10),
    
    quantidade DECIMAL(10,3) NOT NULL CHECK (quantidade > 0),
    preco_unitario DECIMAL(10,2) NOT NULL,
    
    taxa_iva DECIMAL(5,2) NOT NULL DEFAULT 16,
    valor_iva DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    desconto_percentual DECIMAL(5,2) DEFAULT 0 CHECK (desconto_percentual >= 0 AND desconto_percentual <= 100),
    desconto_valor DECIMAL(10,2) DEFAULT 0,
    total_linha DECIMAL(10,2) NOT NULL,
    
    ordem INTEGER,
    
    movimentou_stock BOOLEAN DEFAULT FALSE,
    quantidade_stock_movimentada DECIMAL(10,3) DEFAULT 0
);

-- ============================================================
-- 8. TABELA: movimentos_stock
-- ============================================================

CREATE TABLE IF NOT EXISTS movimentos_stock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id),
    artigo_id UUID REFERENCES artigos(id),
    documento_id UUID REFERENCES documentos(id),
    
    tipo tipo_movimento_stock NOT NULL,
    quantidade INTEGER NOT NULL,
    
    stock_anterior INTEGER NOT NULL,
    stock_posterior INTEGER NOT NULL,
    
    custo_unitario DECIMAL(10,2),
    custo_medio DECIMAL(10,2),
    
    documento_tipo VARCHAR(20),
    documento_numero VARCHAR(30),
    
    observacao TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES utilizadores(id)
);

-- ============================================================
-- 9. TABELA: pagamentos
-- ============================================================

CREATE TABLE IF NOT EXISTS pagamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    documento_id UUID REFERENCES documentos(id),
    entidade_id UUID REFERENCES entidades(id),
    
    metodo metodo_pagamento NOT NULL,
    valor DECIMAL(12,2) NOT NULL CHECK (valor > 0),
    
    data_pagamento TIMESTAMPTZ DEFAULT NOW(),
    data_compensacao DATE,
    
    referencia_externa VARCHAR(255),
    comprovativo_url TEXT,
    
    estado VARCHAR(20) DEFAULT 'PENDENTE' CHECK (estado IN ('PENDENTE', 'CONFIRMADO', 'REJEITADO')),
    
    created_by UUID REFERENCES utilizadores(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10. TABELA: declaracoes_iva (Modelo A)
-- ============================================================

CREATE TABLE IF NOT EXISTS declaracoes_iva (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id),
    periodo_ano INTEGER NOT NULL,
    periodo_mes INTEGER NOT NULL CHECK (periodo_mes BETWEEN 1 AND 12),
    
    -- QUADRO 01: Taxa Normal 16%
    q1_vendas_bens_16 DECIMAL(12,2) DEFAULT 0,
    q1_vendas_bens_iva DECIMAL(12,2) DEFAULT 0,
    q1_vendas_servicos_16 DECIMAL(12,2) DEFAULT 0,
    q1_vendas_servicos_iva DECIMAL(12,2) DEFAULT 0,
    q1_total_base_16 DECIMAL(12,2) DEFAULT 0,
    q1_total_iva_16 DECIMAL(12,2) DEFAULT 0,
    
    -- QUADRO 02: Taxa Intermédia 10%
    q2_bens_10 DECIMAL(12,2) DEFAULT 0,
    q2_bens_iva_10 DECIMAL(12,2) DEFAULT 0,
    q2_servicos_10 DECIMAL(12,2) DEFAULT 0,
    q2_servicos_iva_10 DECIMAL(12,2) DEFAULT 0,
    
    -- QUADRO 03: Taxa Reduzida 5%
    q3_bens_5 DECIMAL(12,2) DEFAULT 0,
    q3_bens_iva_5 DECIMAL(12,2) DEFAULT 0,
    q3_servicos_5 DECIMAL(12,2) DEFAULT 0,
    q3_servicos_iva_5 DECIMAL(12,2) DEFAULT 0,
    
    -- QUADRO 04: Isentas e não sujeitas
    q4_exportacoes DECIMAL(12,2) DEFAULT 0,
    q4_isentos_artigo_15 DECIMAL(12,2) DEFAULT 0,
    q4_nao_sujeitos DECIMAL(12,2) DEFAULT 0,
    
    -- QUADRO 05: Compras (IVA dedutível)
    q5_compras_bens_16 DECIMAL(12,2) DEFAULT 0,
    q5_compras_bens_iva_16 DECIMAL(12,2) DEFAULT 0,
    q5_compras_servicos_16 DECIMAL(12,2) DEFAULT 0,
    q5_compras_servicos_iva_16 DECIMAL(12,2) DEFAULT 0,
    q5_importacoes_bens DECIMAL(12,2) DEFAULT 0,
    q5_importacoes_iva DECIMAL(12,2) DEFAULT 0,
    q5_compras_5 DECIMAL(12,2) DEFAULT 0,
    q5_compras_iva_5 DECIMAL(12,2) DEFAULT 0,
    
    -- QUADRO 06: Apuramento
    q6_iva_liquidado DECIMAL(12,2) DEFAULT 0,
    q6_iva_dedutivel DECIMAL(12,2) DEFAULT 0,
    q6_diferenca DECIMAL(12,2) DEFAULT 0,
    q6_credito_periodo_anterior DECIMAL(12,2) DEFAULT 0,
    q6_iva_a_pagar DECIMAL(12,2) DEFAULT 0,
    q6_credito_transportar DECIMAL(12,2) DEFAULT 0,
    
    estado VARCHAR(20) DEFAULT 'RASCUNHO' CHECK (estado IN ('RASCUNHO', 'VALIDADA', 'SUBMETIDA', 'ACEITE')),
    xml_gerado TEXT,
    data_submissao TIMESTAMPTZ,
    numero_confirmacao_at VARCHAR(50),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(empresa_id, periodo_ano, periodo_mes)
);

-- ============================================================
-- 11. TABELA: notificacoes
-- ============================================================

CREATE TABLE IF NOT EXISTS notificacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_remetente_id UUID REFERENCES empresas(id),
    empresa_destinatario_id UUID REFERENCES empresas(id) NOT NULL,
    
    tipo tipo_notificacao NOT NULL,
    documento_id UUID REFERENCES documentos(id),
    
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT,
    
    lida BOOLEAN DEFAULT FALSE,
    data_leitura TIMESTAMPTZ,
    
    acao_url VARCHAR(255),
    acao_texto VARCHAR(50),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 12. TABELA: auditoria
-- ============================================================

CREATE TABLE IF NOT EXISTS auditoria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tabela VARCHAR(50) NOT NULL,
    registro_id UUID NOT NULL,
    acao VARCHAR(10) NOT NULL CHECK (acao IN ('INSERT', 'UPDATE', 'DELETE')),
    dados_anteriores JSONB,
    dados_novos JSONB,
    utilizador_id UUID REFERENCES utilizadores(id),
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES DE PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_documentos_empresa ON documentos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_documentos_tipo ON documentos(tipo);
CREATE INDEX IF NOT EXISTS idx_documentos_estado ON documentos(estado);
CREATE INDEX IF NOT EXISTS idx_documentos_data ON documentos(data_emissao);
CREATE INDEX IF NOT EXISTS idx_documentos_entidade ON documentos(entidade_id);

CREATE INDEX IF NOT EXISTS idx_linhas_documento ON linhas_documento(documento_id);
CREATE INDEX IF NOT EXISTS idx_linhas_artigo ON linhas_documento(artigo_id);

CREATE INDEX IF NOT EXISTS idx_movimentos_stock_artigo ON movimentos_stock(artigo_id);
CREATE INDEX IF NOT EXISTS idx_movimentos_stock_data ON movimentos_stock(created_at);

CREATE INDEX IF NOT EXISTS idx_pagamentos_documento ON pagamentos(documento_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_estado ON pagamentos(estado);

CREATE INDEX IF NOT EXISTS idx_notificacoes_destinatario ON notificacoes(empresa_destinatario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes(lida);

CREATE INDEX IF NOT EXISTS idx_declaracoes_iva_periodo ON declaracoes_iva(empresa_id, periodo_ano, periodo_mes);

-- ============================================================
-- FUNÇÕES E TRIGGERS
-- ============================================================

-- Função: Numeração atômica de documentos
CREATE OR REPLACE FUNCTION gerar_numero_documento()
RETURNS TRIGGER AS $$
DECLARE
    v_contador_campo TEXT;
    v_serie_campo TEXT;
    v_numero INTEGER;
    v_serie VARCHAR(5);
    v_chave BIGINT;
    v_nuit VARCHAR(9);
BEGIN
    IF NEW.numero IS NULL AND NEW.tipo != 'RASCUNHO' THEN
        -- Lock único para esta empresa+tipo
        v_chave := hashtext(NEW.empresa_id::TEXT || NEW.tipo::TEXT);
        PERFORM pg_advisory_xact_lock(v_chave);
        
        -- Determinar campos baseados no tipo
        CASE NEW.tipo::TEXT
            WHEN 'COTACAO' THEN
                v_contador_campo := 'ultimo_numero_cotacao';
                v_serie_campo := 'serie_cotacao';
            WHEN 'PROFORMA' THEN
                v_contador_campo := 'ultimo_numero_proforma';
                v_serie_campo := 'serie_proforma';
            WHEN 'FACTURA', 'FACTURA_RECIBO' THEN
                v_contador_campo := 'ultimo_numero_factura';
                v_serie_campo := 'serie_factura';
            WHEN 'RECIBO' THEN
                v_contador_campo := 'ultimo_numero_recibo';
                v_serie_campo := 'serie_recibo';
            WHEN 'GUIA' THEN
                v_contador_campo := 'ultimo_numero_guia';
                v_serie_campo := 'serie_guia';
            ELSE
                RAISE EXCEPTION 'Tipo de documento não suportado: %', NEW.tipo;
        END CASE;
        
        -- Atualizar contador e obter novo número
        EXECUTE format(
            'UPDATE empresas SET %I = %I + 1 WHERE id = $1 RETURNING %I, %I',
            v_contador_campo, v_contador_campo, v_contador_campo, v_serie_campo
        ) USING NEW.empresa_id INTO v_numero, v_serie;
        
        NEW.numero := v_numero;
        NEW.serie := v_serie;
        
        -- Obter NUIT da empresa
        SELECT nuit INTO v_nuit FROM empresas WHERE id = NEW.empresa_id;
        
        -- Gerar hash fiscal (NUIT + Série + Número + Data + Total)
        NEW.hash_fiscal := encode(
            digest(
                concat(
                    v_nuit, '|',
                    NEW.serie, '|',
                    NEW.numero::TEXT, '|',
                    NEW.data_emissao::TEXT, '|',
                    COALESCE(NEW.total_pagar, 0)::TEXT
                ),
                'sha256'
            ),
            'hex'
        );
        
        -- Gerar dados QR Code
        NEW.qr_code_data := jsonb_build_object(
            'a', v_nuit,
            'b', NEW.serie || '/' || LPAD(NEW.numero::TEXT, 6, '0'),
            'c', to_char(NEW.data_emissao, 'YYYY-MM-DD'),
            'd', to_char(COALESCE(NEW.total_pagar, 0), 'FM9999999990.00'),
            'e', substring(NEW.hash_fiscal from 1 for 20)
        )::TEXT;
    END IF;
    
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger de numeração
DROP TRIGGER IF EXISTS trigger_numero_documento ON documentos;
CREATE TRIGGER trigger_numero_documento
    BEFORE INSERT OR UPDATE ON documentos
    FOR EACH ROW
    EXECUTE FUNCTION gerar_numero_documento();

-- Função: Atualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers de timestamp
CREATE TRIGGER update_empresas_updated_at BEFORE UPDATE ON empresas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documentos_updated_at BEFORE UPDATE ON documentos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_declaracoes_iva_updated_at BEFORE UPDATE ON declaracoes_iva
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SEED DATA - Dados Iniciais
-- ============================================================

-- Empresa demonstração (apenas se não existir)
INSERT INTO empresas (nuit, nome_fiscal, nome_comercial, cidade, email)
SELECT '400000001', 'FISCAL.MZ SISTEMAS LDA', 'FISCAL.MZ', 'Maputo', 'admin@fiscal.mz'
WHERE NOT EXISTS (SELECT 1 FROM empresas WHERE nuit = '400000001');

-- Utilizador admin (senha: admin123 - hash bcrypt)
INSERT INTO utilizadores (empresa_id, email, password_hash, nome, role)
SELECT 
    (SELECT id FROM empresas WHERE nuit = '400000001'),
    'admin@fiscal.mz',
    '$2b$10$YourHashedPasswordHere', -- Substituir por hash real
    'Administrador',
    'ADMIN'
WHERE NOT EXISTS (SELECT 1 FROM utilizadores WHERE email = 'admin@fiscal.mz');

-- Entidades de exemplo (clientes)
INSERT INTO entidades (empresa_id, nuit, nome, tipo, cidade, email)
SELECT 
    (SELECT id FROM empresas WHERE nuit = '400000001'),
    '400123456',
    'ABC Comercial, LDA',
    'CLIENTE',
    'Maputo',
    'geral@abc.co.mz'
WHERE NOT EXISTS (SELECT 1 FROM entidades WHERE nuit = '400123456');

INSERT INTO entidades (empresa_id, nuit, nome, tipo, cidade, email)
SELECT 
    (SELECT id FROM empresas WHERE nuit = '400000001'),
    '400654321',
    'XYZ Importações, LDA',
    'CLIENTE',
    'Beira',
    'contato@xyz.co.mz'
WHERE NOT EXISTS (SELECT 1 FROM entidades WHERE nuit = '400654321');

-- Artigos de exemplo
INSERT INTO artigos (empresa_id, codigo, descricao, tipo, preco_venda, stock_atual, stock_minimo, categoria_iva)
SELECT 
    (SELECT id FROM empresas WHERE nuit = '400000001'),
    'ART001',
    'Consultoria Fiscal - Hora',
    'SERVICO',
    5000.00,
    0,
    0,
    'TRIBUTAVEL_16'
WHERE NOT EXISTS (SELECT 1 FROM artigos WHERE codigo = 'ART001' AND empresa_id = (SELECT id FROM empresas WHERE nuit = '400000001'));

INSERT INTO artigos (empresa_id, codigo, descricao, tipo, preco_venda, stock_atual, stock_minimo, categoria_iva)
SELECT 
    (SELECT id FROM empresas WHERE nuit = '400000001'),
    'ART002',
    'Despacho Aduaneiro',
    'SERVICO',
    15000.00,
    0,
    0,
    'TRIBUTAVEL_16'
WHERE NOT EXISTS (SELECT 1 FROM artigos WHERE codigo = 'ART002' AND empresa_id = (SELECT id FROM empresas WHERE nuit = '400000001'));

INSERT INTO artigos (empresa_id, codigo, descricao, tipo, preco_venda, stock_atual, stock_minimo, categoria_iva)
SELECT 
    (SELECT id FROM empresas WHERE nuit = '400000001'),
    'PROD001',
    'Software Fiscal - Licença Anual',
    'PRODUTO',
    25000.00,
    100,
    10,
    'TRIBUTAVEL_16'
WHERE NOT EXISTS (SELECT 1 FROM artigos WHERE codigo = 'PROD001' AND empresa_id = (SELECT id FROM empresas WHERE nuit = '400000001'));

COMMIT;

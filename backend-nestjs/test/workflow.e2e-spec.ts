import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Workflow B2B - E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let tenantId: string;
  let clientId: string;
  let quoteId: string;
  let proformaId: string;
  let paymentId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);

    // Setup: Criar tenant e cliente de teste
    const tenantResult = await dataSource.query(
      `INSERT INTO tenants (id, nome, nif, serie_proforma, contador_proforma)
       VALUES (gen_random_uuid(), 'Empresa Teste', '123456789', 'P', 0)
       RETURNING id`
    );
    tenantId = tenantResult[0].id;

    const clientResult = await dataSource.query(
      `INSERT INTO clientes (id, tenant_id, nome, email)
       VALUES (gen_random_uuid(), $1, 'Cliente Teste', 'cliente@teste.com')
       RETURNING id`,
      [tenantId]
    );
    clientId = clientResult[0].id;
  });

  afterAll(async () => {
    // Cleanup
    await dataSource.query('DELETE FROM event_store WHERE tenant_id = $1', [tenantId]);
    await dataSource.query('DELETE FROM documentos_fiscais WHERE tenant_id = $1', [tenantId]);
    await dataSource.query('DELETE FROM pagamentos WHERE tenant_id = $1', [tenantId]);
    await dataSource.query('DELETE FROM proformas WHERE tenant_id = $1', [tenantId]);
    await dataSource.query('DELETE FROM workflow_negociacoes WHERE tenant_id = $1', [tenantId]);
    await dataSource.query('DELETE FROM clientes WHERE tenant_id = $1', [tenantId]);
    await dataSource.query('DELETE FROM tenants WHERE id = $1', [tenantId]);

    await app.close();
  });

  describe('Fluxo Completo: Quote → Pay → Fiscal Invoice', () => {
    it('1. POST /api/v1/quotes - Criar cotação', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/quotes')
        .set('x-tenant-id', tenantId)
        .set('x-user-id', 'user-test-123')
        .set('Idempotency-Key', `test-${Date.now()}`)
        .send({
          clientId,
          items: [
            {
              produtoId: 'prod-1',
              descricao: 'Produto Teste A',
              quantidade: 10,
              precoUnit: 100.00,
              descontoPercent: 5,
            },
            {
              produtoId: 'prod-2',
              descricao: 'Produto Teste B',
              quantidade: 5,
              precoUnit: 200.00,
            },
          ],
          validityDays: 30,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.quoteId).toBeDefined();
      expect(response.body.data.numeroCotacao).toMatch(/^C\/\d{4}\/\d{4}$/);

      quoteId = response.body.data.quoteId;

      // Verificar criação no banco
      const quote = await dataSource.query(
        `SELECT * FROM workflow_negociacoes WHERE id = $1`,
        [quoteId]
      );
      expect(quote[0].status).toBe('RASCUNHO');
      expect(parseFloat(quote[0].total_estimado)).toBeGreaterThan(0);
    });

    it('2. PATCH /api/v1/quotes/:id/accept - Aceitar cotação gera proforma', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/quotes/${quoteId}/accept`)
        .set('x-tenant-id', tenantId)
        .set('x-user-id', clientId)
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verificar cotação convertida
      const quote = await dataSource.query(
        `SELECT * FROM workflow_negociacoes WHERE id = $1`,
        [quoteId]
      );
      expect(quote[0].status).toBe('CONVERTIDA');

      // Verificar proforma criada
      const proforma = await dataSource.query(
        `SELECT * FROM proformas WHERE cotacao_id = $1`,
        [quoteId]
      );
      expect(proforma.length).toBe(1);
      expect(proforma[0].status).toBe('PENDENTE');
      expect(proforma[0].numero_proforma).toMatch(/^P\/\d{4}\/\d+/);

      proformaId = proforma[0].id;
    });

    it('3. POST /api/v1/proformas/:id/pay - Iniciar pagamento M-Pesa', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/proformas/${proformaId}/pay`)
        .set('x-tenant-id', tenantId)
        .set('x-user-id', clientId)
        .set('Idempotency-Key', `pay-${Date.now()}`)
        .send({
          method: 'MPESA',
          telefone: '+258840000000',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.paymentId).toBeDefined();
      expect(response.body.data.status).toBe('PROCESSANDO');

      paymentId = response.body.data.paymentId;

      // Verificar pagamento criado
      const payment = await dataSource.query(
        `SELECT * FROM pagamentos WHERE id = $1`,
        [paymentId]
      );
      expect(payment[0].estado).toBe('PROCESSANDO');
      expect(payment[0].metodo).toBe('MPESA');
    });

    it('4. POST /api/v1/payments/webhook/mpesa - Webhook confirma pagamento', async () => {
      // Simular webhook de confirmação M-Pesa
      const response = await request(app.getHttpServer())
        .post('/api/v1/payments/webhook/mpesa')
        .send({
          transactionId: paymentId,
          status: 'SUCCESS',
          amount: 1500.00,
          reference: proformaId,
        })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verificar pagamento confirmado
      const payment = await dataSource.query(
        `SELECT * FROM pagamentos WHERE id = $1`,
        [paymentId]
      );
      expect(payment[0].estado).toBe('CONCLUIDO');

      // Verificar proforma paga
      const proforma = await dataSource.query(
        `SELECT * FROM proformas WHERE id = $1`,
        [proformaId]
      );
      expect(proforma[0].status).toBe('PAGA');
    });

    it('5. Verificar fatura fiscal gerada automaticamente', async () => {
      // Aguardar processamento assíncrono (handler de evento)
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verificar fatura criada
      const invoice = await dataSource.query(
        `SELECT * FROM documentos_fiscais WHERE proforma_origin_id = $1`,
        [proformaId]
      );

      expect(invoice.length).toBe(1);
      expect(invoice[0].tipo).toBe('FT');
      expect(invoice[0].numero_documento).toMatch(/^FT/);
      expect(invoice[0].estado_pagamento).toBe('PAGO');
      expect(invoice[0].hash_documento).toBeDefined();
      expect(invoice[0].hash_documento.length).toBe(64); // SHA256

      // Verificar evento no event store
      const events = await dataSource.query(
        `SELECT * FROM event_store WHERE aggregate_id = $1`,
        [invoice[0].id]
      );
      expect(events.length).toBeGreaterThan(0);
      expect(events[0].event_type).toBe('InvoiceEmittedEvent');
    });

    it('6. GET /api/v1/wallet/balance - Verificar wallet do tenant', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/wallet/balance')
        .set('x-tenant-id', tenantId)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(parseFloat(response.body.data.balance)).toBeGreaterThan(0);
    });
  });

  describe('Fluxo de Escrow', () => {
    let escrowQuoteId: string;
    let escrowProformaId: string;

    it('7. Criar cotação e proforma com condição ESCROW', async () => {
      // Criar cotação
      const quoteResponse = await request(app.getHttpServer())
        .post('/api/v1/quotes')
        .set('x-tenant-id', tenantId)
        .set('x-user-id', 'user-test-123')
        .set('Idempotency-Key', `escrow-${Date.now()}`)
        .send({
          clientId,
          items: [{
            produtoId: 'prod-3',
            descricao: 'Produto Escrow',
            quantidade: 1,
            precoUnit: 5000.00,
          }],
        })
        .expect(201);

      escrowQuoteId = quoteResponse.body.data.quoteId;

      // Aceitar cotação (gera proforma automaticamente)
      await request(app.getHttpServer())
        .patch(`/api/v1/quotes/${escrowQuoteId}/accept`)
        .set('x-tenant-id', tenantId)
        .set('x-user-id', clientId)
        .send({})
        .expect(200);

      // Buscar proforma criada
      const proforma = await dataSource.query(
        `SELECT * FROM proformas WHERE cotacao_id = $1`,
        [escrowQuoteId]
      );
      escrowProformaId = proforma[0].id;

      // Atualizar para condição ESCROW
      await dataSource.query(
        `UPDATE proformas SET condicoes_pagamento = 'ESCROW' WHERE id = $1`,
        [escrowProformaId]
      );
    });

    it('8. Iniciar pagamento com ESCROW', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/proformas/${escrowProformaId}/pay`)
        .set('x-tenant-id', tenantId)
        .set('x-user-id', clientId)
        .send({ method: 'ESCROW' })
        .expect(201);

      expect(response.body.data.status).toBe('PROCESSANDO');

      // Verificar registro de escrow
      const escrow = await dataSource.query(
        `SELECT * FROM escrow_transactions WHERE proforma_id = $1`,
        [escrowProformaId]
      );
      expect(escrow.length).toBe(1);
      expect(escrow[0].status).toBe('PENDENTE');
    });

    it('9. Confirmar entrega e liberar fundos', async () => {
      const escrow = await dataSource.query(
        `SELECT id FROM escrow_transactions WHERE proforma_id = $1`,
        [escrowProformaId]
      );

      // Confirmar entrega
      await request(app.getHttpServer())
        .post(`/api/v1/escrow/${escrow[0].id}/release`)
        .set('x-tenant-id', tenantId)
        .set('x-user-id', clientId)
        .send({})
        .expect(200);

      // Verificar fundos liberados
      const updatedEscrow = await dataSource.query(
        `SELECT status FROM escrow_transactions WHERE id = $1`,
        [escrow[0].id]
      );
      expect(updatedEscrow[0].status).toBe('LIBERADO');

      // Verificar fatura gerada
      const invoice = await dataSource.query(
        `SELECT * FROM documentos_fiscais WHERE proforma_origin_id = $1`,
        [escrowProformaId]
      );
      expect(invoice.length).toBe(1);
    });
  });

  describe('Validações e Erros', () => {
    it('10. Não deve criar fatura de proforma não paga', async () => {
      // Criar nova cotação e proforma
      const quoteResponse = await request(app.getHttpServer())
        .post('/api/v1/quotes')
        .set('x-tenant-id', tenantId)
        .set('x-user-id', 'user-test-123')
        .set('Idempotency-Key', `unpaid-${Date.now()}`)
        .send({ clientId, items: [{ produtoId: 'p1', descricao: 'Teste', quantidade: 1, precoUnit: 100 }] })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/api/v1/quotes/${quoteResponse.body.data.quoteId}/accept`)
        .set('x-tenant-id', tenantId)
        .set('x-user-id', clientId)
        .send({})
        .expect(200);

      const proforma = await dataSource.query(
        `SELECT id FROM proformas WHERE cotacao_id = $1`,
        [quoteResponse.body.data.quoteId]
      );

      // Tentar gerar fatura sem pagar
      await request(app.getHttpServer())
        .post('/api/v1/fiscal/invoices')
        .set('x-tenant-id', tenantId)
        .send({ proformaId: proforma[0].id })
        .expect(400);
    });

    it('11. Rate limiting em endpoints de pagamento', async () => {
      // Fazer múltiplas requisições rapidamente
      const requests = Array(12).fill(null).map(() =>
        request(app.getHttpServer())
          .post('/api/v1/quotes')
          .set('x-tenant-id', tenantId)
          .set('Idempotency-Key', `rate-${Date.now()}-${Math.random()}`)
          .send({ clientId, items: [{ produtoId: 'p1', descricao: 'Teste', quantidade: 1, precoUnit: 100 }] })
      );

      const responses = await Promise.all(requests);
      
      // Pelo menos uma deve ter sido rate limited (429)
      const hasRateLimit = responses.some(r => r.status === 429);
      expect(hasRateLimit).toBe(true);
    });
  });
});

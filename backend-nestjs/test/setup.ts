/**
 * Setup para testes E2E
 * Configura ambiente de teste com banco de dados isolado
 */

import { config } from 'dotenv';

// Carregar variáveis de ambiente de teste
config({ path: '.env.test' });

// Timeout global para testes E2E
jest.setTimeout(30000);

// Desabilitar logs durante testes
if (process.env.NODE_ENV === 'test') {
  console.log = jest.fn();
  console.debug = jest.fn();
  console.info = jest.fn();
}

// Global teardown
afterAll(async () => {
  // Aguardar conexões fecharem
  await new Promise(resolve => setTimeout(resolve, 500));
});

import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

/**
 * Configuração do Swagger/OpenAPI para documentação da API
 */
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('FISCAL.MZ API')
    .setDescription(`
# FISCAL.MZ 2.0 - API de Gestão Fiscal e B2B

Sistema completo de gestão fiscal para Moçambique, com suporte a:
- Emissão de documentos fiscais (FT, FR, NC, ND)
- Gestão de stock e movimentações
- Modelo A de IVA (declaração mensal à AT)
- Workflow B2B (cotações, proformas, pagamentos)
- Notificações em tempo real

## Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação.
Inclua o token no header: \`Authorization: Bearer <token>\`

## Formatos de Data

Todas as datas devem ser enviadas no formato ISO 8601: \`YYYY-MM-DD\` ou \`YYYY-MM-DDTHH:mm:ss\`

## Valores Monetários

Valores monetários são representados em MZN (Metical moçambicano) com 2 casas decimais.

## Códigos de Erro

- \`400\` - Bad Request (dados inválidos)
- \`401\` - Unauthorized (não autenticado)
- \`403\` - Forbidden (sem permissão)
- \`404\` - Not Found (recurso não encontrado)
- \`422\` - Unprocessable Entity (validação falhou)
- \`500\` - Internal Server Error

## Suporte

Para suporte técnico, contacte: suporte@fiscal.mz
    `)
    .setVersion('2.0.0')
    .setContact('FISCAL.MZ', 'https://fiscal.mz', 'suporte@fiscal.mz')
    .setLicense('Proprietário', 'https://fiscal.mz/licenca')
    
    // Tags organizadas por módulo
    .addTag('Autenticação', 'Login, registo e gestão de sessão')
    .addTag('Empresas', 'Gestão de empresas e configurações')
    .addTag('Utilizadores', 'Gestão de utilizadores e permissões')
    .addTag('Entidades', 'Clientes e fornecedores')
    .addTag('Artigos', 'Produtos e serviços')
    .addTag('Documentos', 'Faturas, recibos, notas de crédito/débito')
    .addTag('Cotações', 'Workflow de cotações B2B')
    .addTag('Proformas', 'Gestão de proformas e pagamentos')
    .addTag('Stock', 'Movimentações e controlo de inventário')
    .addTag('Fiscal', 'Modelo A de IVA e declarações')
    .addTag('Notificações', 'Notificações em tempo real')
    .addTag('Pagamentos', 'Processamento de pagamentos')
    .addTag('Dashboard', 'Estatísticas e relatórios')
    .addTag('Seed', 'Dados de teste')
    
    // Segurança JWT
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Token JWT obtido no login',
        in: 'header',
      },
      'JWT-auth',
    )
    
    // Servidores
    .addServer('http://localhost:3000/v1', 'Desenvolvimento local')
    .addServer('https://api.fiscal.mz/v1', 'Produção')
    
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) =>
      `${controllerKey.replace('Controller', '')}_${methodKey}`,
  });

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customCss: `
      .topbar { display: none }
      .swagger-ui .info { margin: 30px 0 }
      .swagger-ui .info h1 { font-size: 32px; color: #1a365d }
      .swagger-ui .info h2 { font-size: 24px; color: #2d3748 }
    `,
    customSiteTitle: 'FISCAL.MZ API Docs',
    customfavIcon: '/favicon.ico',
  });

  console.log('📚 Swagger documentation available at: /api/docs');
}

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());
  app.use(compression());
  
  // CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', '*'),
    credentials: true,
  });

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Validation
  app.useGlobalPipe(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('FISCAL.MZ 2.0 API')
    .setDescription('API completa para gestão fiscal e B2B Marketplace')
    .setVersion('2.0.0')
    .addBearerAuth()
    .addTag('Workflow', 'Gestão de cotações e proformas')
    .addTag('Payments', 'Orchestração de pagamentos')
    .addTag('Fiscal', 'Documentos fiscais (FT, Recibos)')
    .addTag('Wallet', 'Gestão de carteira e saques')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get('PORT', 3000);
  await app.listen(port);
  
  console.log(`🚀 FISCAL.MZ 2.0 API running on port ${port}`);
  console.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs`);
}

bootstrap();

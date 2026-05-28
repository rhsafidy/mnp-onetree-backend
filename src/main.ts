// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── Security ───────────────────────────────────────────────────────────────
  app.use(helmet());
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? 'https://mnp.mg' : '*',
    credentials: true,
  });

  // ── Compression ────────────────────────────────────────────────────────────
  app.use(compression());

  // ── Validation (applies to all DTOs) ──────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unknown properties
      forbidNonWhitelisted: true,
      transform: true, // auto-transform types (string → number, etc.)
    }),
  );

  // ── API prefix ─────────────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ── Swagger documentation ──────────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Un Touriste — Un Arbre API')
      .setDescription('MNP field application REST API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    console.log(
      `📚 Swagger: http://localhost:${process.env.PORT ?? 3000}/api/docs`,
    );
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 API running on http://localhost:${port}/api/v1`);
}

bootstrap();

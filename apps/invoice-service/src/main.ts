import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { InvoiceModule } from './invoice.module';

async function bootstrap() {
  const app = await NestFactory.create(InvoiceModule);

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Invoice Service')
    .setDescription('The Invoice Service API description')
    .setVersion('1.0')
    .addTag('invoices')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/invoices/docs', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors();

  const port = process.env.PORT || 3002;
  await app.listen(port);

  console.log(`Invoice Service is running on: http://localhost:${port}`);
}

bootstrap();

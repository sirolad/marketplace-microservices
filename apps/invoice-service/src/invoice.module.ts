import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { InvoiceController } from './infrastructure/controllers/invoice.controller';
import {
  Invoice as InvoiceModel,
  InvoiceSchema,
} from './infrastructure/persistence/invoice.schema';
import { InvoiceRepositoryImpl } from './infrastructure/persistence/invoice.repository.impl';
import { INVOICE_REPOSITORY } from './domain/repositories/invoice.repository';
import { UploadInvoiceUseCase } from './application/use-cases/upload-invoice.use-case';
import { SendInvoiceUseCase } from './application/use-cases/send-invoice.use-case';
import { GetInvoiceUseCase } from './application/use-cases/get-invoice.use-case';
import { FileStorageService } from './infrastructure/file-storage/file-storage.service';
import { EventConsumerService } from './infrastructure/events/event-consumer.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/marketplace',
      }),
    }),
    MongooseModule.forFeature([{ name: InvoiceModel.name, schema: InvoiceSchema }]),
  ],
  controllers: [InvoiceController],
  providers: [
    {
      provide: INVOICE_REPOSITORY,
      useClass: InvoiceRepositoryImpl,
    },
    UploadInvoiceUseCase,
    SendInvoiceUseCase,
    GetInvoiceUseCase,
    FileStorageService,
    EventConsumerService,
  ],
})
export class InvoiceModule {}

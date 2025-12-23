import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderController } from './infrastructure/controllers/order.controller';
import { Order as OrderModel, OrderSchema } from './infrastructure/persistence/order.schema';
import { OrderRepositoryImpl } from './infrastructure/persistence/order.repository.impl';
import { ORDER_REPOSITORY } from './domain/repositories/order.repository';
import { CreateOrderUseCase } from './application/use-cases/create-order.use-case';
import { UpdateOrderStatusUseCase } from './application/use-cases/update-order-status.use-case';
import {
  GetOrderByIdUseCase,
  ListOrdersUseCase,
} from './application/use-cases/get-orders.use-case';
import { EventPublisherService } from './infrastructure/events/event-publisher.service';

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
    MongooseModule.forFeature([{ name: OrderModel.name, schema: OrderSchema }]),
  ],
  controllers: [OrderController],
  providers: [
    {
      provide: ORDER_REPOSITORY,
      useClass: OrderRepositoryImpl,
    },
    CreateOrderUseCase,
    UpdateOrderStatusUseCase,
    GetOrderByIdUseCase,
    ListOrdersUseCase,
    EventPublisherService,
  ],
})
export class OrderModule {}

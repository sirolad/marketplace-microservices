import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { CreateOrderUseCase } from '../../application/use-cases/create-order.use-case';
import { UpdateOrderStatusUseCase } from '../../application/use-cases/update-order-status.use-case';
import {
  GetOrderByIdUseCase,
  ListOrdersUseCase,
} from '../../application/use-cases/get-orders.use-case';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  ListOrdersQueryDto,
  OrderResponseDto,
} from '../../application/dtos/order.dto';
import { EventPublisherService } from '../events/event-publisher.service';
import { Order } from '../../domain/entities/order.entity';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly updateOrderStatusUseCase: UpdateOrderStatusUseCase,
    private readonly getOrderByIdUseCase: GetOrderByIdUseCase,
    private readonly listOrdersUseCase: ListOrdersUseCase,
    private readonly eventPublisher: EventPublisherService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrder(@Body(ValidationPipe) dto: CreateOrderDto): Promise<OrderResponseDto> {
    const order = await this.createOrderUseCase.execute(dto);

    // Publish domain events
    const events = order.getDomainEvents();
    for (const event of events) {
      await this.eventPublisher.publish(event);
    }
    order.clearDomainEvents();

    return this.toResponseDto(order);
  }

  @Get()
  async listOrders(@Query(ValidationPipe) query: ListOrdersQueryDto): Promise<OrderResponseDto[]> {
    const orders = await this.listOrdersUseCase.execute(query);
    return orders.map((order) => this.toResponseDto(order));
  }

  @Get(':id')
  async getOrder(@Param('id') id: string): Promise<OrderResponseDto> {
    const order = await this.getOrderByIdUseCase.execute(id);
    return this.toResponseDto(order);
  }

  @Patch(':id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body(ValidationPipe) dto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    const order = await this.updateOrderStatusUseCase.execute(id, dto.status);

    // Publish domain events
    const events = order.getDomainEvents();
    for (const event of events) {
      await this.eventPublisher.publish(event);
    }
    order.clearDomainEvents();

    return this.toResponseDto(order);
  }

  private toResponseDto(order: Order): OrderResponseDto {
    return {
      id: order.id,
      productId: order.productId,
      customerId: order.customerId,
      sellerId: order.sellerId,
      price: order.price,
      quantity: order.quantity,
      status: order.status.toString(),
      totalPrice: order.getTotalPrice(),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}

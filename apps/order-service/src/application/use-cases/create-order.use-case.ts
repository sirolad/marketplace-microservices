import { Inject, Injectable } from '@nestjs/common';
import { Order } from '../../domain/entities/order.entity';
import { IOrderRepository, ORDER_REPOSITORY } from '../../domain/repositories/order.repository';
import { CreateOrderDto } from '../dtos/order.dto';

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(dto: CreateOrderDto): Promise<Order> {
    const order = Order.create({
      productId: dto.productId,
      customerId: dto.customerId,
      sellerId: dto.sellerId,
      price: dto.price,
      quantity: dto.quantity,
    });

    return await this.orderRepository.save(order);
  }
}

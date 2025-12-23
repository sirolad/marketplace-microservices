import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IOrderRepository, ORDER_REPOSITORY } from '../../domain/repositories/order.repository';
import { OrderStatusVO } from '../../domain/value-objects/order-status.vo';
import { Order } from '../../domain/entities/order.entity';

@Injectable()
export class UpdateOrderStatusUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(orderId: string, newStatus: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    const statusVO = OrderStatusVO.create(newStatus);
    order.updateStatus(statusVO);

    return await this.orderRepository.update(order);
  }
}

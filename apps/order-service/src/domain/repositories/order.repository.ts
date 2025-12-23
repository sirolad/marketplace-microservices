import { Order } from '../entities/order.entity';

export interface OrderFilters {
  sellerId?: string;
  customerId?: string;
  status?: string;
}

export interface IOrderRepository {
  save(order: Order): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  findAll(filters?: OrderFilters): Promise<Order[]>;
  update(order: Order): Promise<Order>;
}

export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');

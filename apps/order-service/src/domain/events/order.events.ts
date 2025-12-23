import { OrderStatus } from '../value-objects/order-status.vo';

export interface DomainEvent {
  readonly eventName: string;
  readonly occurredOn: Date;
  readonly aggregateId: string;
}

export class OrderCreatedEvent implements DomainEvent {
  readonly eventName = 'order.created';
  readonly occurredOn: Date;

  constructor(
    public readonly aggregateId: string,
    public readonly productId: string,
    public readonly customerId: string,
    public readonly sellerId: string,
    public readonly price: number,
    public readonly quantity: number,
  ) {
    this.occurredOn = new Date();
  }
}

export class OrderStatusChangedEvent implements DomainEvent {
  readonly eventName = 'order.status.changed';
  readonly occurredOn: Date;

  constructor(
    public readonly aggregateId: string,
    public readonly oldStatus: OrderStatus,
    public readonly newStatus: OrderStatus,
  ) {
    this.occurredOn = new Date();
  }
}

export class OrderShippedEvent implements DomainEvent {
  readonly eventName = 'order.shipped';
  readonly occurredOn: Date;

  constructor(
    public readonly aggregateId: string,
    public readonly sellerId: string,
  ) {
    this.occurredOn = new Date();
  }
}

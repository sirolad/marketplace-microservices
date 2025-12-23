import { v4 as uuidv4 } from 'uuid';
import { OrderStatus, OrderStatusVO } from '../value-objects/order-status.vo';
import {
  DomainEvent,
  OrderCreatedEvent,
  OrderShippedEvent,
  OrderStatusChangedEvent,
} from '../events/order.events';

export interface OrderProps {
  id?: string;
  productId: string;
  customerId: string;
  sellerId: string;
  price: number;
  quantity: number;
  status?: OrderStatusVO;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Order {
  private readonly _id: string;
  private readonly _productId: string;
  private readonly _customerId: string;
  private readonly _sellerId: string;
  private readonly _price: number;
  private readonly _quantity: number;
  private _status: OrderStatusVO;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _domainEvents: DomainEvent[] = [];

  private constructor(props: Required<OrderProps>) {
    this._id = props.id;
    this._productId = props.productId;
    this._customerId = props.customerId;
    this._sellerId = props.sellerId;
    this._price = props.price;
    this._quantity = props.quantity;
    this._status = props.status;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static create(props: OrderProps): Order {
    this.validate(props);

    const order = new Order({
      id: props.id || uuidv4(),
      productId: props.productId,
      customerId: props.customerId,
      sellerId: props.sellerId,
      price: props.price,
      quantity: props.quantity,
      status: props.status || OrderStatusVO.fromEnum(OrderStatus.CREATED),
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    });

    if (!props.id) {
      order.addDomainEvent(
        new OrderCreatedEvent(
          order._id,
          order._productId,
          order._customerId,
          order._sellerId,
          order._price,
          order._quantity,
        ),
      );
    }

    return order;
  }

  private static validate(props: OrderProps): void {
    if (!props.productId || props.productId.trim() === '') {
      throw new Error('Product ID is required');
    }
    if (!props.customerId || props.customerId.trim() === '') {
      throw new Error('Customer ID is required');
    }
    if (!props.sellerId || props.sellerId.trim() === '') {
      throw new Error('Seller ID is required');
    }
    if (props.price <= 0) {
      throw new Error('Price must be greater than 0');
    }
    if (props.quantity <= 0 || !Number.isInteger(props.quantity)) {
      throw new Error('Quantity must be a positive integer');
    }
  }

  updateStatus(newStatus: OrderStatusVO): void {
    if (!this._status.canTransitionTo(newStatus)) {
      throw new Error(
        `Cannot transition from ${this._status.toString()} to ${newStatus.toString()}`,
      );
    }

    const oldStatus = this._status.getValue();
    this._status = newStatus;
    this._updatedAt = new Date();

    this.addDomainEvent(new OrderStatusChangedEvent(this._id, oldStatus, newStatus.getValue()));

    if (newStatus.getValue() === OrderStatus.SHIPPED) {
      this.addDomainEvent(new OrderShippedEvent(this._id, this._sellerId));
    }
  }

  private addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  getDomainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  get id(): string {
    return this._id;
  }

  get productId(): string {
    return this._productId;
  }

  get customerId(): string {
    return this._customerId;
  }

  get sellerId(): string {
    return this._sellerId;
  }

  get price(): number {
    return this._price;
  }

  get quantity(): number {
    return this._quantity;
  }

  get status(): OrderStatusVO {
    return this._status;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  getTotalPrice(): number {
    return this._price * this._quantity;
  }
}

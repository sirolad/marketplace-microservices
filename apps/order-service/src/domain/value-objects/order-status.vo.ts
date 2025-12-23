export enum OrderStatus {
  CREATED = 'Created',
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',
  SHIPPING_IN_PROGRESS = 'Shipping in progress',
  SHIPPED = 'Shipped',
}

export class OrderStatusVO {
  private constructor(private readonly value: OrderStatus) {}

  static create(status: string): OrderStatusVO {
    const normalizedStatus = this.normalizeStatus(status);
    if (!this.isValid(normalizedStatus)) {
      throw new Error(`Invalid order status: ${status}`);
    }
    return new OrderStatusVO(normalizedStatus as OrderStatus);
  }

  static fromEnum(status: OrderStatus): OrderStatusVO {
    return new OrderStatusVO(status);
  }

  private static normalizeStatus(status: string): string {
    const statusMap: Record<string, OrderStatus> = {
      created: OrderStatus.CREATED,
      accepted: OrderStatus.ACCEPTED,
      rejected: OrderStatus.REJECTED,
      'shipping in progress': OrderStatus.SHIPPING_IN_PROGRESS,
      'shippinginprogress': OrderStatus.SHIPPING_IN_PROGRESS,
      shipped: OrderStatus.SHIPPED,
    };
    return statusMap[status.toLowerCase()] || status;
  }

  private static isValid(status: string): boolean {
    return Object.values(OrderStatus).includes(status as OrderStatus);
  }

  getValue(): OrderStatus {
    return this.value;
  }

  toString(): string {
    return this.value;
  }

  equals(other: OrderStatusVO): boolean {
    return this.value === other.value;
  }

  canTransitionTo(newStatus: OrderStatusVO): boolean {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.CREATED]: [OrderStatus.ACCEPTED, OrderStatus.REJECTED],
      [OrderStatus.ACCEPTED]: [OrderStatus.SHIPPING_IN_PROGRESS],
      [OrderStatus.REJECTED]: [],
      [OrderStatus.SHIPPING_IN_PROGRESS]: [OrderStatus.SHIPPED],
      [OrderStatus.SHIPPED]: [],
    };

    return transitions[this.value].includes(newStatus.getValue());
  }
}

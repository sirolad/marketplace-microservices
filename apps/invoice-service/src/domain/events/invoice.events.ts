export interface DomainEvent {
  readonly eventName: string;
  readonly occurredOn: Date;
  readonly aggregateId: string;
}

export class InvoiceSentEvent implements DomainEvent {
  readonly eventName = 'invoice.sent';
  readonly occurredOn: Date;

  constructor(
    public readonly aggregateId: string,
    public readonly orderId: string,
  ) {
    this.occurredOn = new Date();
  }
}

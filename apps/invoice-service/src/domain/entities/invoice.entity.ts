import { v4 as uuidv4 } from 'uuid';
import { InvoiceSentEvent } from '../events/invoice.events';

export interface InvoiceProps {
  id?: string;
  orderId: string;
  pdfPath: string;
  sentAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Invoice {
  private readonly _id: string;
  private readonly _orderId: string;
  private readonly _pdfPath: string;
  private _sentAt: Date | null;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _domainEvents: InvoiceSentEvent[] = [];

  private constructor(props: Required<InvoiceProps>) {
    this._id = props.id;
    this._orderId = props.orderId;
    this._pdfPath = props.pdfPath;
    this._sentAt = props.sentAt;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static create(props: InvoiceProps): Invoice {
    if (!props.orderId || props.orderId.trim() === '') {
      throw new Error('Order ID is required');
    }
    if (!props.pdfPath || props.pdfPath.trim() === '') {
      throw new Error('PDF path is required');
    }

    return new Invoice({
      id: props.id || uuidv4(),
      orderId: props.orderId,
      pdfPath: props.pdfPath,
      sentAt: props.sentAt || null,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    });
  }

  markAsSent(): void {
    if (this._sentAt) {
      throw new Error('Invoice has already been sent');
    }

    this._sentAt = new Date();
    this._updatedAt = new Date();

    this._domainEvents.push(new InvoiceSentEvent(this._id, this._orderId));
  }

  getDomainEvents(): InvoiceSentEvent[] {
    return [...this._domainEvents];
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  get id(): string {
    return this._id;
  }

  get orderId(): string {
    return this._orderId;
  }

  get pdfPath(): string {
    return this._pdfPath;
  }

  get sentAt(): Date | null {
    return this._sentAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  isSent(): boolean {
    return this._sentAt !== null;
  }
}

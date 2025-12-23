import { Invoice } from '../entities/invoice.entity';

export interface IInvoiceRepository {
  save(invoice: Invoice): Promise<Invoice>;
  findById(id: string): Promise<Invoice | null>;
  findByOrderId(orderId: string): Promise<Invoice | null>;
  update(invoice: Invoice): Promise<Invoice>;
}

export const INVOICE_REPOSITORY = Symbol('INVOICE_REPOSITORY');

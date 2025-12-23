import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Invoice } from '../../domain/entities/invoice.entity';
import {
  IInvoiceRepository,
  INVOICE_REPOSITORY,
} from '../../domain/repositories/invoice.repository';

@Injectable()
export class SendInvoiceUseCase {
  constructor(
    @Inject(INVOICE_REPOSITORY)
    private readonly invoiceRepository: IInvoiceRepository,
  ) {}

  async execute(orderId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findByOrderId(orderId);
    if (!invoice) {
      throw new NotFoundException(`Invoice for order ${orderId} not found`);
    }

    if (invoice.isSent()) {
      return invoice;
    }

    invoice.markAsSent();
    return await this.invoiceRepository.update(invoice);
  }
}

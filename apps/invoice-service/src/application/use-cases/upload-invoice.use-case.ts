import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { Invoice } from '../../domain/entities/invoice.entity';
import {
  IInvoiceRepository,
  INVOICE_REPOSITORY,
} from '../../domain/repositories/invoice.repository';

@Injectable()
export class UploadInvoiceUseCase {
  constructor(
    @Inject(INVOICE_REPOSITORY)
    private readonly invoiceRepository: IInvoiceRepository,
  ) {}

  async execute(orderId: string, pdfPath: string): Promise<Invoice> {
    const existing = await this.invoiceRepository.findByOrderId(orderId);
    if (existing) {
      throw new ConflictException(`Invoice for order ${orderId} already exists`);
    }

    const invoice = Invoice.create({
      orderId,
      pdfPath,
    });

    return await this.invoiceRepository.save(invoice);
  }
}

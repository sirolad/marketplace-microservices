import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice } from '../../domain/entities/invoice.entity';
import { IInvoiceRepository } from '../../domain/repositories/invoice.repository';
import { Invoice as InvoiceModel, InvoiceDocument } from './invoice.schema';

@Injectable()
export class InvoiceRepositoryImpl implements IInvoiceRepository {
  constructor(
    @InjectModel(InvoiceModel.name)
    private readonly invoiceModel: Model<InvoiceDocument>,
  ) {}

  async save(invoice: Invoice): Promise<Invoice> {
    const invoiceDoc = new this.invoiceModel({
      _id: invoice.id,
      orderId: invoice.orderId,
      pdfPath: invoice.pdfPath,
      sentAt: invoice.sentAt,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    });

    await invoiceDoc.save();
    return this.toDomain(invoiceDoc);
  }

  async findById(id: string): Promise<Invoice | null> {
    const invoiceDoc = await this.invoiceModel.findById(id).exec();
    if (!invoiceDoc) {
      return null;
    }
    return this.toDomain(invoiceDoc);
  }

  async findByOrderId(orderId: string): Promise<Invoice | null> {
    const invoiceDoc = await this.invoiceModel.findOne({ orderId }).exec();
    if (!invoiceDoc) {
      return null;
    }
    return this.toDomain(invoiceDoc);
  }

  async update(invoice: Invoice): Promise<Invoice> {
    await this.invoiceModel
      .findByIdAndUpdate(
        invoice.id,
        {
          sentAt: invoice.sentAt,
          updatedAt: invoice.updatedAt,
        },
        { new: true },
      )
      .exec();

    return invoice;
  }

  private toDomain(doc: InvoiceDocument): Invoice {
    return Invoice.create({
      id: doc._id,
      orderId: doc.orderId,
      pdfPath: doc.pdfPath,
      sentAt: doc.sentAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type InvoiceDocument = HydratedDocument<Invoice>;

@Schema({ collection: 'invoices', timestamps: true })
export class Invoice {
  @Prop({ required: true, unique: true })
  _id: string;

  @Prop({ required: true, unique: true })
  orderId: string;

  @Prop({ required: true })
  pdfPath: string;

  @Prop({ default: null })
  sentAt: Date | null;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

InvoiceSchema.index({ orderId: 1 });

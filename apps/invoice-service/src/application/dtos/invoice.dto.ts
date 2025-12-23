import { IsString } from 'class-validator';

export class UploadInvoiceDto {
  @IsString()
  orderId: string;
}

export class InvoiceResponseDto {
  id: string;
  orderId: string;
  pdfPath: string;
  sentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

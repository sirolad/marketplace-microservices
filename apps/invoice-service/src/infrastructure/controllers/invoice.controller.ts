import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Body,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadInvoiceUseCase } from '../../application/use-cases/upload-invoice.use-case';
import { GetInvoiceUseCase } from '../../application/use-cases/get-invoice.use-case';
import { UploadInvoiceDto, InvoiceResponseDto } from '../../application/dtos/invoice.dto';
import { FileStorageService } from '../file-storage/file-storage.service';
import { Invoice } from '../../domain/entities/invoice.entity';

@Controller('invoices')
export class InvoiceController {
  constructor(
    private readonly uploadInvoiceUseCase: UploadInvoiceUseCase,
    private readonly getInvoiceUseCase: GetInvoiceUseCase,
    private readonly fileStorageService: FileStorageService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async uploadInvoice(
    @Body(ValidationPipe) dto: UploadInvoiceDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<InvoiceResponseDto> {
    if (!file) {
      throw new BadRequestException('PDF file is required');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF files are allowed');
    }

    const pdfPath = await this.fileStorageService.saveFile(file);
    const invoice = await this.uploadInvoiceUseCase.execute(dto.orderId, pdfPath);

    return this.toResponseDto(invoice);
  }

  @Get(':orderId')
  async getInvoice(@Param('orderId') orderId: string): Promise<InvoiceResponseDto> {
    const invoice = await this.getInvoiceUseCase.execute(orderId);
    return this.toResponseDto(invoice);
  }

  private toResponseDto(invoice: Invoice): InvoiceResponseDto {
    return {
      id: invoice.id,
      orderId: invoice.orderId,
      pdfPath: invoice.pdfPath,
      sentAt: invoice.sentAt,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    };
  }
}

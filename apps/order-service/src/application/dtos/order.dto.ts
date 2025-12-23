import { IsString, IsNumber, IsPositive, IsInt, IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from '../../domain/value-objects/order-status.vo';

export class CreateOrderDto {
  @IsString()
  productId: string;

  @IsString()
  customerId: string;

  @IsString()
  sellerId: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsInt()
  @IsPositive()
  quantity: number;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

export class ListOrdersQueryDto {
  @IsOptional()
  @IsString()
  sellerId?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class OrderResponseDto {
  id: string;
  productId: string;
  customerId: string;
  sellerId: string;
  price: number;
  quantity: number;
  status: string;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from '../../domain/entities/order.entity';
import { IOrderRepository, OrderFilters } from '../../domain/repositories/order.repository';
import { OrderStatusVO } from '../../domain/value-objects/order-status.vo';
import { Order as OrderModel, OrderDocument } from './order.schema';

@Injectable()
export class OrderRepositoryImpl implements IOrderRepository {
  constructor(
    @InjectModel(OrderModel.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {}

  async save(order: Order): Promise<Order> {
    const orderDoc = new this.orderModel({
      _id: order.id,
      productId: order.productId,
      customerId: order.customerId,
      sellerId: order.sellerId,
      price: order.price,
      quantity: order.quantity,
      status: order.status.toString(),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    });

    await orderDoc.save();
    return this.toDomain(orderDoc);
  }

  async findById(id: string): Promise<Order | null> {
    const orderDoc = await this.orderModel.findById(id).exec();
    if (!orderDoc) {
      return null;
    }
    return this.toDomain(orderDoc);
  }

  async findAll(filters?: OrderFilters): Promise<Order[]> {
    const query: Record<string, unknown> = {};

    if (filters?.sellerId) {
      query.sellerId = filters.sellerId;
    }
    if (filters?.customerId) {
      query.customerId = filters.customerId;
    }
    if (filters?.status) {
      query.status = filters.status;
    }

    const orderDocs = await this.orderModel.find(query).sort({ createdAt: -1 }).exec();
    return orderDocs.map((doc) => this.toDomain(doc));
  }

  async update(order: Order): Promise<Order> {
    await this.orderModel
      .findByIdAndUpdate(
        order.id,
        {
          status: order.status.toString(),
          updatedAt: order.updatedAt,
        },
        { new: true },
      )
      .exec();

    return order;
  }

  private toDomain(doc: OrderDocument): Order {
    return Order.create({
      id: doc._id,
      productId: doc.productId,
      customerId: doc.customerId,
      sellerId: doc.sellerId,
      price: doc.price,
      quantity: doc.quantity,
      status: OrderStatusVO.create(doc.status),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}

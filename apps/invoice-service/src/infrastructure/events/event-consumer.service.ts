import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { SendInvoiceUseCase } from '../../application/use-cases/send-invoice.use-case';

interface OrderShippedEvent {
  eventName: string;
  aggregateId: string;
  sellerId: string;
  occurredOn: string;
}

@Injectable()
export class EventConsumerService implements OnModuleInit {
  private connection: any;
  private channel: amqp.Channel;
  private readonly exchange = 'marketplace.events';
  private readonly queue = 'invoice-service.order-shipped';
  private readonly routingKey = 'order.shipped';
  private readonly logger = new Logger(EventConsumerService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly sendInvoiceUseCase: SendInvoiceUseCase,
  ) {}

  async onModuleInit() {
    await this.connect();
    await this.consume();
  }

  private async connect() {
    const rabbitmqUri = this.configService.get<string>('RABBITMQ_URI')!;
    this.connection = await amqp.connect(rabbitmqUri);
    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
    await this.channel.assertQueue(this.queue, { durable: true });
    await this.channel.bindQueue(this.queue, this.exchange, this.routingKey);

    this.logger.log('Connected to RabbitMQ and bound queue');
  }

  private async consume() {
    await this.channel.consume(this.queue, async (msg) => {
      if (!msg) return;

      try {
        const event: OrderShippedEvent = JSON.parse(msg.content.toString());
        this.logger.log(`Received OrderShipped event for order: ${event.aggregateId}`);

        await this.sendInvoiceUseCase.execute(event.aggregateId);
        this.logger.log(`Invoice sent for order: ${event.aggregateId}`);

        this.channel.ack(msg);
      } catch (error) {
        this.logger.error(`Failed to process event: ${error.message}`, error.stack);
        this.channel.nack(msg, false, false);
      }
    });
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }
}

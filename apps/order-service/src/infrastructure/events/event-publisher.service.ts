import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { DomainEvent } from '../../domain/events/order.events';

@Injectable()
export class EventPublisherService implements OnModuleInit {
  private connection: any;
  private channel: amqp.Channel;
  private readonly exchange = 'marketplace.events';

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  private async connect() {
    const rabbitmqUri = this.configService.get<string>('RABBITMQ_URI')!;
    this.connection = await amqp.connect(rabbitmqUri);
    this.channel = await this.connection.createChannel();
    await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
  }

  async publish(event: DomainEvent): Promise<void> {
    const routingKey = event.eventName;
    const message = Buffer.from(JSON.stringify(event));

    this.channel.publish(this.exchange, routingKey, message, {
      persistent: true,
      timestamp: Date.now(),
    });
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }
}

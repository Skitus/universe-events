import { Module, OnModuleInit } from '@nestjs/common';
import { NatsClient } from './nats.client';
import { WebhookController } from './webhook.controller';

@Module({
  controllers: [WebhookController],
  providers: [NatsClient],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly nats: NatsClient) {}

  async onModuleInit() {
    await this.nats.connect();
  }
}

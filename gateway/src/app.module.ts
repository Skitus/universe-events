import { Module, OnModuleInit } from '@nestjs/common';
import { NatsClient } from './nats.client';
import { WebhookController } from './webhook.controller';
import { HealthController } from './health.controller';

@Module({
  controllers: [WebhookController, HealthController],
  providers: [NatsClient],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly nats: NatsClient) {}

  async onModuleInit() {
    await this.nats.connect();
  }
}

import { Module } from '@nestjs/common';
import { NatsClient } from '@universe/shared';
import { WebhookController } from './webhook.controller';
import { HealthController } from './health.controller';

@Module({
  controllers: [WebhookController, HealthController],
  providers: [NatsClient],
})
export class AppModule {}

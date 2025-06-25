import { Body, Controller, Headers, Post } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { eventSchema, EventDto } from './event.schema';
import { NatsClient } from './nats.client';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly nats: NatsClient) {}

  @Post()
  async handle(@Body() body: unknown, @Headers('x-correlation-id') cid?: string) {
    const parsed = eventSchema.parse(body);
    const events: EventDto[] = Array.isArray(parsed) ? parsed : [parsed];

    const correlationId = cid ?? randomUUID();

    await Promise.all(
      events.map((e) => this.nats.publish(`events.${e.source}.${e.funnelStage}`, e, correlationId)),
    );

    return { ok: true, correlationId };
  }
}

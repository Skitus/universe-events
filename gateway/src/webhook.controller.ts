import { Body, Controller, Headers, Post } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { EventDto, EventsSchema, NatsClient } from '@universe/shared';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly nats: NatsClient) {}

  @Post()
  async handle(@Body() body: unknown, @Headers('x-correlation-id') cid?: string) {
    const parsed = EventsSchema.parse(body);
    const events: EventDto[] = Array.isArray(parsed) ? parsed : [parsed];

    const correlationId = cid ?? randomUUID();

    await Promise.all(
      events.map((e) => this.nats.publish(`events.${e.source}.${e.funnelStage}`, e, correlationId)),
    );

    return { ok: true, correlationId };
  }
}

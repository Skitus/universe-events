import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { NatsClient } from './nats.client';
import { eventSchema } from './event.schema';
import { PrismaService } from './prisma.service';

@Injectable()
export class CollectorService implements OnModuleInit {
  private readonly log = new Logger(CollectorService.name);

  constructor(
    private readonly nats: NatsClient,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.nats.connect();

    const subject = process.env.NATS_SUBJECT ?? 'events.facebook.>';
    this.nats.subscribe(subject, async (raw, hdrs) => {
      let ev;
      try {
        ev = eventSchema.parse(raw);
      } catch (err) {
        this.log.error('❌ Invalid event schema, skipping message', (err as Error).message);
        return;
      }

      const ts = new Date(ev.timestamp);
      if (Number.isNaN(ts.getTime())) {
        this.log.error(`❌ Invalid timestamp "${ev.timestamp}" for event ${ev.eventId}, skipping`);
        return;
      }

      await this.prisma.facebookEvent.create({
        data: {
          eventId: ev.eventId,
          timestamp: ts,
          source: ev.source,
          funnelStage: ev.funnelStage,
          eventType: ev.eventType,
          data: ev.data as object,
          correlationId: hdrs['x-correlation-id'] ?? null,
        },
      });

      this.log.debug(`✅ saved event ${ev.eventId}`);
    });

    this.log.log(`Subscribed on ${subject}`);
  }
}

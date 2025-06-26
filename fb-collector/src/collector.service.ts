import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventDto, EventsSchema, PrismaService, NatsClient } from '@universe/shared';

@Injectable()
export class FacebookCollectorService implements OnModuleInit {
  private readonly log = new Logger(FacebookCollectorService.name);

  constructor(
    private readonly nats: NatsClient,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit(): Promise<void> {
    const subject = process.env.NATS_SUBJECT ?? 'events.facebook.>';

    // Ждём завершения инициализации NatsClient перед подпиской
    await this.nats.initializationPromise; // Используем публичный геттер

    try {
      await this.nats.subscribe(subject, async (raw, hdrs) => {
        let events: EventDto[];
        try {
          const parsed = EventsSchema.parse(raw);
          events = Array.isArray(parsed) ? parsed : [parsed];
        } catch (err) {
          this.log.error('❌ Invalid event schema, skipping message', (err as Error).message);
          return;
        }

        // Используем Promise.all для асинхронных операций в цикле
        await Promise.all(
          events.map(async (ev) => {
            const ts = new Date(ev.timestamp);
            if (Number.isNaN(ts.getTime())) {
              this.log.error(
                `❌ Invalid timestamp "${ev.timestamp}" for event ${ev.eventId}, skipping`,
              );
              return;
            }

            await this.prisma.event.create({
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
          }),
        );
      });

      this.log.log(`Subscribed on ${subject}`);
    } catch (err) {
      this.log.error('Failed to subscribe:', err);
    }
  }
}

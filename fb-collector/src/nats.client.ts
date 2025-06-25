import {
  JetStreamManager,
  JetStreamSubscription,
  NatsConnection,
  StorageType,
  StringCodec,
  connect,
  consumerOpts,
  headers as natsHeaders,
} from 'nats';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

@Injectable()
export class NatsClient implements OnModuleInit, OnModuleDestroy {
  private nc!: NatsConnection;
  private js!: ReturnType<NatsConnection['jetstream']>;
  private jsm!: JetStreamManager;
  private readonly sc = StringCodec();
  private readonly log = new Logger(NatsClient.name);

  async onModuleInit(): Promise<void> {
    this.nc = await connect({ servers: process.env.NATS_URL });
    this.js = this.nc.jetstream();
    this.jsm = await this.nc.jetstreamManager();

    try {
      await this.jsm.streams.info('events');
    } catch {
      await this.jsm.streams.add({
        name: 'events',
        subjects: ['events.>'],
        storage: StorageType.File,
      });
      this.log.debug('Stream "events" created');
    }

    this.log.log('Connected to NATS & stream ready');
  }

  async onModuleDestroy(): Promise<void> {
    await this.nc?.drain();
  }

  /**
   * Optional explicit connect wrapper if you need manual connect
   */
  async connect(): Promise<void> {
    await this.onModuleInit();
  }

  async publish(subject: string, payload: unknown, cid: string): Promise<void> {
    const h = natsHeaders();
    h.set('x-correlation-id', cid);
    await this.js.publish(subject, this.sc.encode(JSON.stringify(payload)), { headers: h });
  }

  async subscribe(
    subject: string,
    handler: (data: unknown, hdrs: Record<string, string>) => Promise<void>,
  ): Promise<void> {
    const opts = consumerOpts();
    opts.deliverTo('fb-workers');
    opts.durable('fb-workers');
    opts.manualAck();
    opts.ackExplicit();
    opts.queue('fb-workers');

    const subscription: JetStreamSubscription = await this.js.subscribe(subject, opts);
    this.log.log(`Subscribed to ${subject} (durable: fb-workers)`);

    (async () => {
      for await (const msg of subscription) {
        const data = JSON.parse(this.sc.decode(msg.data));
        const hdrs: Record<string, string> = {};
        if (msg.headers) {
          for (const [key, values] of msg.headers) {
            const [firstValue] = values;
            hdrs[key] = firstValue;
          }
        }
        try {
          await handler(data, hdrs);
          msg.ack();
        } catch (err) {
          this.log.error('Handler failed, redelivering', err as Error);
          msg.nak();
        }
      }
    })();
  }
}

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import {
  connect,
  NatsConnection,
  JetStreamManager,
  StringCodec,
  StorageType,
  consumerOpts,
  JetStreamSubscription,
  headers,
} from 'nats';

@Injectable()
export class NatsClient implements OnModuleInit, OnModuleDestroy {
  private nc!: NatsConnection;
  private js!: ReturnType<NatsConnection['jetstream']>;
  private jsm!: JetStreamManager;
  private readonly sc = StringCodec();
  private readonly log = new Logger(NatsClient.name);

  private jetStreamReady: boolean = false; // Tracks JetStream initialization state

  get initializationPromise(): Promise<void> {
    return new Promise((resolve) => {
      if (this.jetStreamReady) {
        resolve(); // JetStream already ready
      } else {
        // Wait for initialization
        const interval = setInterval(() => {
          if (this.jetStreamReady) {
            clearInterval(interval);
            resolve();
          }
        }, 100); // Check every 100ms
      }
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      this.nc = await connect({ servers: process.env.NATS_URL });
      this.js = this.nc.jetstream();
      this.jsm = await this.nc.jetstreamManager();

      this.log.log('Successfully connected to NATS');

      try {
        await this.jsm.streams.info('events');
      } catch (err) {
        this.log.error('Failed to find stream "events", creating a new stream', err);
        await this.jsm.streams.add({
          name: 'events',
          subjects: ['events.*'],
          storage: StorageType.File,
        });
        this.log.debug('Stream "events" created');
      }

      this.jetStreamReady = true;
      this.log.log('JetStream is ready for publishing/subscribing');
    } catch (err) {
      this.log.error('Failed to initialize NATS connection or JetStream', err);
      this.jetStreamReady = false;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.nc) {
      await this.nc.drain(); // Gracefully close the NATS connection
    }
  }

  async publish(subject: string, payload: unknown, cid: string): Promise<void> {
    await this.initializationPromise; // Wait for initialization

    const hdrs = headers();
    hdrs.set('Nats-Stream-Source', 'stream-1');
    hdrs.set('x-correlation-id', cid);

    try {
      await this.js.publish(subject, this.sc.encode(JSON.stringify(payload)), { headers: hdrs });
      this.log.log(`Message published to ${subject}`);
    } catch (err) {
      this.log.error(`Failed to publish message to ${subject}:`, err);
    }
  }

  async subscribe(
    subject: string,
    handler: (data: unknown, hdrs: Record<string, string>) => Promise<void>,
  ): Promise<void> {
    await this.initializationPromise; // Wait for initialization

    const safeSubject = subject.replace(/[^a-zA-Z0-9_]/g, '_');
    const durableName = `${safeSubject}_workers`;

    const opts = consumerOpts();
    opts.deliverTo(`${durableName}`);
    opts.durable(durableName);
    opts.manualAck();
    opts.ackExplicit();
    opts.queue(durableName);

    try {
      const sub: JetStreamSubscription = await this.js.subscribe(subject, opts);
      this.log.log(`Subscribed to ${subject} (durable: ${durableName})`);

      (async () => {
        for await (const msg of sub) {
          const data = JSON.parse(this.sc.decode(msg.data));
          const hdrs = Array.from(msg.headers || []).reduce(
            (acc, [key, [value]]) => {
              acc[key] = value;
              return acc;
            },
            {} as Record<string, string>,
          );

          try {
            await handler(data, hdrs);
            msg.ack();
          } catch (err) {
            this.log.error('Handler failed, redelivering', err as Error);
            msg.nak();
          }
        }
      })();
    } catch (err) {
      this.log.error(`Failed to subscribe to subject ${subject}:`, err);
    }
  }
}

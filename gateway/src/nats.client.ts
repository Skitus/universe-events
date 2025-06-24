import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import {
  connect,
  headers as natsHeaders,
  JetStreamClient,
  JetStreamManager,
  NatsConnection,
  StringCodec,
  StorageType,
} from 'nats';

@Injectable()
export class NatsClient implements OnModuleDestroy {
  private nc!: NatsConnection;

  private js!: JetStreamClient;

  private jsm!: JetStreamManager;

  private readonly sc = StringCodec();

  private readonly log = new Logger(NatsClient.name);

  async connect() {
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
      this.log.log('Stream "events" created');
    }

    this.log.log('Connected to NATS & stream ready');
  }

  async publish(subject: string, payload: unknown, cid: string) {
    const h = natsHeaders();
    h.set('x-correlation-id', cid);

    await this.js.publish(subject, this.sc.encode(JSON.stringify(payload)), {
      headers: h,
    });
  }

  async onModuleDestroy() {
    await this.nc.drain();
  }
}

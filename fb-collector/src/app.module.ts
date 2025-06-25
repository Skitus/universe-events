import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { NatsClient } from './nats.client';
import { CollectorService } from './collector.service';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
  providers: [PrismaService, NatsClient, CollectorService],
})
export class AppModule {}

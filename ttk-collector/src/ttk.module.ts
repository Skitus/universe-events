import { Module } from '@nestjs/common';
import { TtkCollectorService } from './collector.service';
import { HealthController } from './health.controller';
import { NatsClient, PrismaService } from '@universe/shared';

@Module({
  controllers: [HealthController],
  providers: [TtkCollectorService, PrismaService, NatsClient]
})
export class TtkCollectorModule {}

import { Module } from '@nestjs/common';
import { NatsClient, PrismaService } from '@universe/shared';
import { CollectorService } from './collector.service';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
  providers: [PrismaService, NatsClient, CollectorService],
})
export class AppModule {}

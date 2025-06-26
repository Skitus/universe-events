import { Module } from '@nestjs/common';
import { NatsClient, PrismaService } from '@universe/shared';
import { FacebookCollectorService } from './collector.service';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
  providers: [PrismaService, NatsClient, FacebookCollectorService],
})
export class FacebookCollectorModule {}

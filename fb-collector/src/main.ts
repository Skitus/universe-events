import { NestFactory } from '@nestjs/core';
import { FacebookCollectorModule } from './fb.module';

async function bootstrap() {
  const app = await NestFactory.create(FacebookCollectorModule);
  await app.listen(process.env.PORT ?? 3003);
}
bootstrap();

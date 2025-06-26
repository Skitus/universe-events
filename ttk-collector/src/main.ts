import { NestFactory } from '@nestjs/core';
import { TtkCollectorModule } from './ttk.module';

async function bootstrap() {
  const app = await NestFactory.create(TtkCollectorModule);
  await app.listen(process.env.PORT ?? 3004);
}
bootstrap();

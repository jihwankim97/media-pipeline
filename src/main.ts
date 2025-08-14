import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //정의하지 않은 값은 dto 반영 안함
      forbidNonWhitelisted: true, //정의하지 않은 값에 대하여 에러를 반환.
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

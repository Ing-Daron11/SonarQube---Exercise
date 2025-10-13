import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  //permitir el acceso a la API desde el frontend
  //esto es para que el frontend pueda hacer peticiones a la API
  app.enableCors({
    origin: [process.env.FRONTEND_URL,
      'http://localhost:3000'],
    credentials: true, //Esto es para las cookies
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { graphqlUploadExpress } from 'graphql-upload';
import * as express from 'express';
import * as path from 'path';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './libs/interceptor/Logging.interceptor';
import { WsAdapter } from '@nestjs/platform-ws';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.useGlobalPipes(new ValidationPipe());
	app.useGlobalInterceptors(new LoggingInterceptor());
	app.enableCors({ origin: '*', credentials: true });
	app.use(graphqlUploadExpress({ maxFile: 15000000, maxFiles: 10 }));
	// Seed data references images as /img/products/<file>, but the files live in ./uploads.
	// Serve both paths from the same absolute directory so it resolves regardless of CWD.
	const uploadsDir = path.join(process.cwd(), 'uploads');
	app.use('/uploads', express.static(uploadsDir));
	app.use('/img/products', express.static(uploadsDir));

	app.useWebSocketAdapter(new WsAdapter(app));
	await app.listen(process.env.PORT_API ?? 3000);
}
bootstrap();

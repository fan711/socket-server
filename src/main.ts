import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { RedisIoAdapter } from "./websocket/adapters/redis-io.adapter";

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { cors: true });
    app.useWebSocketAdapter(new RedisIoAdapter(app));

    await app.listen(process.env.PORT || 3000);
}

bootstrap();

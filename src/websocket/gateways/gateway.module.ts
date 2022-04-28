import { Logger, Module } from "@nestjs/common";
import { SocketEventGateway } from "./socket-event.gateway";
import { RedisModule } from "../../redis/redis.module";
import { AdapterModule } from "../adapters/adapter.module";

@Module({
    imports: [RedisModule, AdapterModule, Logger],
    providers: [SocketEventGateway, Logger],
    exports: [SocketEventGateway],
})
export class GatewayModule {}

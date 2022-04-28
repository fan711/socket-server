import { Global, Module } from "@nestjs/common";
import { AdapterService } from "./adapter.service";
import { RedisModule } from "../../redis/redis.module";

@Global()
@Module({
    imports: [RedisModule],
    providers: [AdapterService],
    exports: [AdapterService],
})
export class AdapterModule {}

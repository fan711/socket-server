import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { RedisProvider } from "./redis.provider";

const redisProvider = {
    provide: RedisProvider,
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
        const provider = new RedisProvider(configService);
        await provider.waitForClientReady(provider.getDefaultClusterClient());
        return provider;
    },
};

@Module({
    imports: [ConfigModule],
    providers: [redisProvider],
    exports: [redisProvider],
})
export class RedisModule {}

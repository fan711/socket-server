import * as IORedis from "ioredis";
import { createAdapter } from "@socket.io/redis-adapter";
import { INestApplicationContext, Logger } from "@nestjs/common";
import { Server } from "socket.io";
import { ConfigService } from "@nestjs/config";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { AdapterService } from "./adapter.service";

export class RedisIoAdapter extends IoAdapter {
    private readonly logger = new Logger(RedisIoAdapter.name);
    private readonly adapterService: AdapterService;
    private readonly configService: ConfigService;

    private static readonly redisClusterMap = new Map<Server, IORedis.Redis[]>();

    constructor(private readonly app: INestApplicationContext) {
        super(app);
        this.adapterService = app.get(AdapterService);
        this.configService = app.get(ConfigService);
    }

    private createRedisClient(pubSub: string) {
        const host = this.configService.get<string>("REDIS_HOST");
        const port = this.configService.get<number>("REDIS_PORT");

        return new IORedis({
            host,
            port,
            connectionName: `Backend_RedisIoAdapter_${pubSub}`,
        })
            .on("ready", () => {
                this.logger.log(`Redis ${pubSub} client has successfully established the connection.`);
            })
            .on("error", (err: Error) => {
                this.logger.error(`Redis ${pubSub} client Error: ${err.message}`);
            });
    }

    createIOServer(port: number, options?: any): any {
        const server: Server = super.createIOServer(port, options);
        const clients: IORedis.Redis[] = [];
        RedisIoAdapter.redisClusterMap.set(server, clients);

        const subClient = this.createRedisClient("SUB");
        const pubClient = this.createRedisClient("PUB");

        clients.push(subClient, pubClient);

        server.adapter(createAdapter(pubClient, subClient));

        server.of("/socket").use((socket, next) =>
            this.adapterService
                .joinStage(socket)
                .then(() => next())
                .catch((ex) => {
                    setTimeout(() => socket.disconnect(), 1000);
                    return next(ex);
                }),
        );

        return server;
    }

    async close(server: Server): Promise<void> {
        const clients = RedisIoAdapter.redisClusterMap.get(server);
        RedisIoAdapter.redisClusterMap.delete(server);

        if (clients && clients.length > 0) {
            await Promise.all(clients.map((cluster) => cluster.quit()));
        }

        return super.close(server);
    }
}

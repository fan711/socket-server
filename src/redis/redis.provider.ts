import { Inject, Injectable, Logger, OnApplicationShutdown } from "@nestjs/common";
import IORedis from "ioredis";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class RedisProvider implements OnApplicationShutdown {
    private readonly logger: Logger;
    private readonly redisHost: string;
    private readonly redisNatMap: IORedis.NatMap;
    private readonly redisPort: number;
    private readonly clusterClients: Map<string, IORedis.Cluster>;
    private readonly pubSubClients: Map<string, IORedis.Redis>;

    constructor(@Inject(ConfigService) private readonly configService: ConfigService) {
        this.logger = new Logger(RedisProvider.name);
        this.clusterClients = new Map();
        this.pubSubClients = new Map();
        this.redisNatMap = {};

        const natMap: string[] | undefined = this.configService.get<string[]>("REDIS_NAT_MAP");
        while (natMap && natMap.length > 1) {
            const source = natMap.shift()!;
            const target = natMap.shift()!.split(":");
            this.redisNatMap[source] = {
                host: target[0],
                port: parseInt(target[1], 10),
            };
        }

        this.redisHost = this.configService.get<string>("REDIS_HOST")!;
        this.redisPort = this.configService.get<number>("REDIS_PORT")!;
    }

    getOrCreateClusterClient(
        clientKey: string,
        enableReadyCheck = true,
        options: IORedis.ClusterOptions = {},
    ): IORedis.Cluster {
        let client = this.clusterClients.get(clientKey);
        if (client) {
            return client;
        }

        client = new IORedis.Cluster([{ host: this.redisHost, port: this.redisPort }], {
            slotsRefreshTimeout: 2000,
            enableReadyCheck,
            redisOptions: {
                ...options,
                connectionName: `Backend_RedisProvider_Cluster_${clientKey}`,
            },
            natMap: this.redisNatMap,
        });

        this.attachStartupListeners(client);
        this.clusterClients.set(clientKey, client);
        return client;
    }

    getOrCreatePubSubClient(clientKey: string, options: IORedis.RedisOptions = {}): IORedis.Redis {
        let client = this.pubSubClients.get(clientKey);
        if (client) {
            return client;
        }

        client = new IORedis({
            ...options,
            host: this.redisHost,
            port: this.redisPort,
            connectionName: `Backend_RedisProvider_PubSub_${clientKey}`,
            commandTimeout: 2000,
        });

        this.attachStartupListeners(client);
        this.pubSubClients.set(clientKey, client);
        return client;
    }

    private attachStartupListeners(client: IORedis.Cluster | IORedis.Redis): void {
        let resolved = false;
        let retries = 0;

        client.once("ready", () => {
            this.logger.log("Redis connection successfully established.");
            resolved = true;
        });

        client.on("error", (error) => {
            if (!resolved) {
                if (++retries > this.configService.get<number>("REDIS_MAX_CONNECTION_RETRIES")!) {
                    this.logger.error(
                        `Redis connection could not be established after ${retries - 1} retries: ${error.message}`,
                    );
                }
            }
        });
    }

    async waitForClientReady(client: IORedis.Cluster | IORedis.Redis): Promise<void> {
        return new Promise<void>((resolve) => {
            if (client.status !== "ready") {
                this.logger.log("Waiting for Redis client ready...");
                client.once("ready", () => {
                    this.logger.log("Redis client ready.");
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    getDefaultClusterClient(): IORedis.Cluster {
        return this.getOrCreateClusterClient("default");
    }

    getDefaultPubClient(): IORedis.Redis {
        return this.getOrCreatePubSubClient("defaultPub");
    }

    getDefaultSubClient(): IORedis.Redis {
        return this.getOrCreatePubSubClient("defaultSub");
    }

    async onApplicationShutdown(): Promise<void> {
        const clients = [...Array.from(this.clusterClients.values()), ...Array.from(this.pubSubClients.values())];

        this.clusterClients.clear();
        this.pubSubClients.clear();

        return Promise.all(
            clients.map((client) => {
                const endPromise = new Promise<void>((resolve) => {
                    client.on("end", () => resolve());
                });

                return client
                    .quit()
                    .then(() => client.disconnect(false))
                    .then(() => endPromise);
            }),
        ).then();
    }
}

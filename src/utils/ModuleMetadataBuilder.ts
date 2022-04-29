import * as Joi from "joi";
import { ConfigModule } from "@nestjs/config";
import { ModuleMetadata } from "@nestjs/common";
import { AppController } from "../app.controller";
import { AppService } from "../app.service";

export class ModuleMetadataBuilder {
    static build(additionalModules: Array<{ new (): any }>, testing: boolean = false): ModuleMetadata {
        const imports = [];

        additionalModules.forEach((additionalModule) => imports.push(additionalModule));

        const customJoi = Joi.extend((joi) => ({
            base: joi.array(),
            coerce: (value: string) => ({
                value: value.split ? value.split(" ") : value,
            }),
            type: "redisNatMap",
        }));

        imports.push(
            ConfigModule.forRoot({
                envFilePath: `.env.${process.env.NODE_ENV}`,
                cache: true,
                validationSchema: Joi.object({
                    REDIS_HOST: Joi.string().hostname().default("localhost"),
                    REDIS_NAT_MAP: customJoi.redisNatMap().items(
                        Joi.string()
                            .required()
                            .pattern(/^[a-z0-9-._]+:[0-9]{2,5}$/),
                    ),
                    REDIS_PORT: Joi.number().port().default(6379),
                    REDIS_MAX_CONNECTION_RETRIES: Joi.number().integer().greater(0).default(3),
                }),
            }),
        );

        return {
            imports,
            controllers: testing ? [] : [AppController],
            providers: [AppService],
        };
    }
}

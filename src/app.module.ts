import { Module } from "@nestjs/common";
import { ModuleMetadataBuilder } from "./utils/ModuleMetadataBuilder";
import { GatewayModule } from "./websocket/gateways/gateway.module";

@Module(ModuleMetadataBuilder.build([GatewayModule]))
export class AppModule {}

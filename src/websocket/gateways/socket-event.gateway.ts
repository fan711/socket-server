import {
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WsException,
    WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";
import { AdapterService } from "../adapters/adapter.service";

@WebSocketGateway({
    transports: ["websocket"],
    namespace: "/socket",
    cookie: false,
    pingInterval: 2500,
})
export class SocketEventGateway implements OnGatewayInit, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger: Logger;

    constructor(private adapterService: AdapterService) {
        this.logger = new Logger(SocketEventGateway.name);
    }

    private async emitQuestionToServerSockets(question: string): Promise<void> {
        this.logger.debug(`Emitting question to server sockets.`);
        this.server.local
            .to("room")
            .fetchSockets()
            .then((sockets) => {
                this.logger.debug(`Fetched available local sockets: ${sockets.length}`);

                sockets.forEach(async (socket) => {
                    this.logger.debug(`Emitting to socket ${socket.id}`);
                    this.server.to(socket.id).emit("question", question);
                });
            });
    }

    async emitNewQuestion(question: string): Promise<void> {
        // emit to local server sockets
        this.emitQuestionToServerSockets(question);
        // emit server side events
        this.server.serverSideEmit("newQuestion", question);
    }

    afterInit(server: Server): void {
        server.on("newQuestion", (question: string) => {
            this.logger.debug(`Received server side question: ${question}`);
            // receive server side events
            this.emitQuestionToServerSockets(question);
        });
    }

    @SubscribeMessage("question")
    handleQuestion(client: any, question: string) {
        this.logger.debug(`Received question from client: ${question}`);
        this.emitNewQuestion(question);
    }

    handleDisconnect(client: Socket): Promise<void> {
        return this.adapterService.leaveStage(client).catch((error) => {
            if (client.connected) throw new WsException(error.message);
        });
    }
}

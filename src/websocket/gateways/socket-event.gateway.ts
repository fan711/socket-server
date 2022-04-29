import {
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WsException,
    WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
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

    constructor(private adapterService: AdapterService) {}

    private async emitQuestionToServerSockets(question: string): Promise<void> {
        this.server.local
            .to("room")
            .fetchSockets()
            .then((sockets) => {
                sockets.forEach(async (socket) => {
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
            // receive server side events
            this.emitQuestionToServerSockets(question);
        });
    }

    @SubscribeMessage("question")
    handleQuestion(client: any, question: string) {
        this.emitNewQuestion(question);
    }

    handleDisconnect(client: Socket): Promise<void> {
        return this.adapterService.leaveStage(client).catch((error) => {
            if (client.connected) throw new WsException(error.message);
        });
    }
}

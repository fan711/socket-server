import { BeforeApplicationShutdown, Injectable } from "@nestjs/common";
import { Socket } from "socket.io";
import { WsException } from "@nestjs/websockets";

@Injectable()
export class AdapterService implements BeforeApplicationShutdown {
    private readonly joinedClients = new Set<Socket>();

    async joinStage(socket: Socket): Promise<void> {
        try {
            const room = "room";
            socket.join(room);
            this.joinedClients.add(socket);
        } catch (error: any) {
            throw new WsException(error.message);
        }

        return Promise.resolve();
    }

    async leaveStage(socket: Socket): Promise<void> {
        try {
            const room = "room";
            socket.leave(room);
            this.joinedClients.delete(socket);
        } catch (error: any) {
            throw new WsException(error.message);
        }

        return Promise.resolve();
    }

    async beforeApplicationShutdown(): Promise<void> {
        const promises: Promise<void>[] = [];
        this.joinedClients.forEach((clientSocket) => promises.push(this.leaveStage(clientSocket)));

        return Promise.all(promises).then();
    }
}

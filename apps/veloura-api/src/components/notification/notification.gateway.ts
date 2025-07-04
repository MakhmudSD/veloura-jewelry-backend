import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws'; // native ws types

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server; // native ws server

  // Map userId => WebSocket connection
  private clients = new Map<string, WebSocket>();

  handleConnection(client: WebSocket) {
    const userId = this.getUserIdFromClient(client);
    if (userId) {
      this.clients.set(userId, client);
      console.log(`Client connected with userId: ${userId}`);
    } else {
      console.warn('Client connected but no userId found. Closing connection.');
      client.close();
    }
  }

  handleDisconnect(client: WebSocket) {
    const userId = this.getUserIdFromClient(client);
    if (userId) {
      this.clients.delete(userId);
      console.log(`Client disconnected with userId: ${userId}`);
    }
  }

  sendNotification(receiverId: string, payload: any) {
    const client = this.clients.get(receiverId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payload));
      console.log(`Notification sent to userId: ${receiverId}`);
    } else {
      console.log(`No open connection for userId: ${receiverId}`);
    }
  }

  private getUserIdFromClient(client: WebSocket): string | null {
    // The URL looks like: ws://yourserver.com?userId=someId
    // We parse userId from query string

    // @ts-ignore
    const req = client.upgradeReq || client._socket?.upgradeReq || null;
    if (!req || !req.url) return null;

    try {
      const url = req.url;
      const params = new URLSearchParams(url.split('?')[1]);
      return params.get('userId');
    } catch {
      return null;
    }
  }
}

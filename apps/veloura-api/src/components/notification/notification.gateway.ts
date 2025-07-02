import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Notification } from '../../libs/dto/notification/notification';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  sendNotificationToUser(receiverId: string, notification: Notification) {
    this.server.to(receiverId).emit('newNotification', notification);
  }

  public sendNotification(receiverId: string, payload: any) {
    this.server.to(receiverId).emit('notification', payload);
  }
}

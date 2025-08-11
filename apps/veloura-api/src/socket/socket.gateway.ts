import {
	WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody, ConnectedSocket,
  } from '@nestjs/websockets';
import { Socket } from 'dgram';
  import { WebSocket } from 'ws';
  
  @WebSocketGateway({
	cors: { origin: '*'},
  })
  export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
	private clients = new Set<WebSocket>();
  
	async handleConnection(client: WebSocket, req: any) {
	  this.clients.add(client);
	  client.send(JSON.stringify({ event: 'info', action: 'connected', total: this.clients.size }));
	}
  
	handleDisconnect(client: WebSocket) {
	  this.clients.delete(client);
	  this.broadcast({ event: 'info', action: 'disconnected', total: this.clients.size });
	}
  
	private broadcast(payload: any) {
	  const data = JSON.stringify(payload);
	  for (const c of this.clients) {
		if (c.readyState === c.OPEN) c.send(data);
	  }
	}
  
	@SubscribeMessage('ping')
	onPing(@ConnectedSocket() client: WebSocket) {
	  client.send(JSON.stringify({ event: 'pong' }));
	}
  
	@SubscribeMessage('message')
	onMessage(@MessageBody() body: any, @ConnectedSocket() _client: WebSocket) {
	  // expect { data: string }
	  const data = typeof body?.data === 'string' ? body.data : '';
	  if (!data) return;
	  this.broadcast({ event: 'message', data });
	}
  }

  export default SocketGateway;
  
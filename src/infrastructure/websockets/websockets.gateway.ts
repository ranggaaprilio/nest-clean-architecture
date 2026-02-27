import { Inject } from '@nestjs/common'
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Socket, Server } from 'socket.io'
import { instrument } from '@socket.io/admin-ui'
import { ILogger, ILoggerToken } from '../../domain/logger/logger.interface'

@WebSocketGateway(81, { transports: ['websocket'], cors: true })
export class WebsocketsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject(ILoggerToken)
    private readonly logger: ILogger
  ) {}

  @WebSocketServer() io: Server
  private clients: Set<Socket> = new Set()

  afterInit() {
    this.logger.log('WebsocketsGateway', 'Initialized socket')
    instrument(this.io, {
      auth: false,
      mode: 'development',
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleConnection(client: Socket, ...args: never[]) {
    const { sockets } = this.io.sockets

    this.logger.log('WebsocketsGateway', `Client id: ${client.id} connected`)
    this.logger.debug(
      'WebsocketsGateway',
      `Number of connected clients: ${sockets.size}`
    )
  }

  handleDisconnect(client: Socket) {
    this.logger.log('WebsocketsGateway', `Cliend id:${client.id} disconnected`)
  }

  @SubscribeMessage('ping')
  handleMessage(client: Socket, data: any) {
    this.logger.log(
      'WebsocketsGateway',
      `Message received from client id: ${client.id}`
    )
    this.logger.debug('WebsocketsGateway', `Payload: ${data}`)
    return {
      event: 'pong',
      data,
    }
  }
}

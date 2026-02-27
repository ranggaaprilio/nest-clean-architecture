import { Module } from '@nestjs/common'
import { WebsocketsGateway } from './websockets.gateway'
import { LoggerModule } from '../logger/logger.module'

@Module({
  imports: [LoggerModule],
  providers: [WebsocketsGateway],
})
export class WebsocketsModule {}

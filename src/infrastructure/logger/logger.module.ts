import { Module } from '@nestjs/common'
import { LoggerService } from './logger.service'
import { ILoggerToken } from '../../domain/logger/logger.interface'

@Module({
  providers: [
    LoggerService,
    {
      provide: ILoggerToken,
      useExisting: LoggerService,
    },
  ],
  exports: [LoggerService, ILoggerToken],
})
export class LoggerModule {}

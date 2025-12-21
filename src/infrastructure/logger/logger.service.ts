import { Injectable } from '@nestjs/common'
import pino from 'pino'
import { ILogger } from '../../domain/logger/logger.interface'

@Injectable()
export class LoggerService implements ILogger {
  private readonly logger: pino.Logger
  private readonly isProduction: boolean

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production'
    this.logger = pino({
      level: this.isProduction ? 'info' : 'debug',
      base: undefined,
      timestamp: pino.stdTimeFunctions.isoTime,
      transport: this.isProduction
        ? undefined
        : {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'yyyy-mm-dd HH:MM:ss.l o',
              ignore: 'pid,hostname',
            },
          },
    })
  }

  debug(context: string, message: string) {
    if (!this.isProduction) {
      this.logger.debug({ context }, message)
    }
  }

  log(context: string, message: string) {
    this.logger.info({ context }, message)
  }

  error(context: string, message: string, trace?: string) {
    this.logger.error({ context, trace }, message)
  }

  warn(context: string, message: string) {
    this.logger.warn({ context }, message)
  }

  verbose(context: string, message: string) {
    if (!this.isProduction) {
      this.logger.trace({ context }, message)
    }
  }
}

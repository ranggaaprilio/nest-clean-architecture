import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { LoggerService } from '../../logger/logger.service'
import { JSONAPIFormatter } from '../jsonapi/jsonapi.formatter'

interface IError {
  message: string
  code_error: string
}

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  private readonly formatter: JSONAPIFormatter

  constructor(private readonly logger: LoggerService) {
    this.formatter = new JSONAPIFormatter()
  }

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request: any = ctx.getRequest()

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR
    const message =
      exception instanceof HttpException
        ? (exception.getResponse() as IError)
        : { message: (exception as Error).message, code_error: null }

    // Create JSON:API error response
    const error = this.formatter.createError(
      status,
      this.getErrorTitle(status),
      message.message,
      {
        pointer: request.url,
      },
      message.code_error,
      undefined,
      undefined,
      {
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    )

    const errorResponse = this.formatter.formatErrorResponse(
      [error],
      {
        timestamp: new Date().toISOString(),
      },
      {
        self: `${request.protocol}://${request.get('host')}${request.url}`,
      },
    )

    this.logMessage(request, message, status, exception)

    response.status(status).json(errorResponse)
  }

  private getErrorTitle(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad Request'
      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized'
      case HttpStatus.FORBIDDEN:
        return 'Forbidden'
      case HttpStatus.NOT_FOUND:
        return 'Not Found'
      case HttpStatus.CONFLICT:
        return 'Conflict'
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'Unprocessable Entity'
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'Internal Server Error'
      default:
        return 'Error'
    }
  }

  private logMessage(
    request: any,
    message: IError,
    status: number,
    exception: any,
  ) {
    if (status === 500) {
      this.logger.error(
        `End Request for ${request.path}`,
        `method=${request.method} status=${status} code_error=${
          message.code_error ? message.code_error : null
        } message=${message.message ? message.message : null}`,
        status >= 500 ? exception.stack : '',
      )
    } else {
      this.logger.warn(
        `End Request for ${request.path}`,
        `method=${request.method} status=${status} code_error=${
          message.code_error ? message.code_error : null
        } message=${message.message ? message.message : null}`,
      )
    }
  }
}

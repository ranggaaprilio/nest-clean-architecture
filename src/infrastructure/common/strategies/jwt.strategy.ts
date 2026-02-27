import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Inject, Injectable } from '@nestjs/common'
import { Request } from 'express'
import { UsecasesProxyModule } from '../../usecases-proxy/usecases-proxy.module'
import { UseCaseProxy } from '../../usecases-proxy/usecases-proxy'
import { LoginUseCases } from '../../../usecases/auth/login.usecases'
import {
  IException,
  IExceptionToken,
} from '../../../domain/exceptions/exceptions.interface'
import { ILogger, ILoggerToken } from '../../../domain/logger/logger.interface'
import { JWTConfig, JWTConfigToken } from '../../../domain/config/jwt.interface'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(UsecasesProxyModule.LOGIN_USECASES_PROXY)
    private readonly loginUsecaseProxy: UseCaseProxy<LoginUseCases>,
    @Inject(ILoggerToken)
    private readonly logger: ILogger,
    @Inject(IExceptionToken)
    private readonly exceptionService: IException,
    @Inject(JWTConfigToken)
    jwtConfig: JWTConfig
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.Authentication
        },
      ]),
      secretOrKey: jwtConfig.getJwtSecret(),
    })
  }

  async validate(payload: any) {
    const user = await this.loginUsecaseProxy
      .getInstance()
      .validateUserForJWTStragtegy(payload.username)
    if (!user) {
      this.logger.warn('JwtStrategy', `User not found`)
      this.exceptionService.UnauthorizedException({ message: 'User not found' })
    }
    return user
  }
}

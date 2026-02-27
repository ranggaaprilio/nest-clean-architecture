import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Inject, Injectable } from '@nestjs/common'
import { Request } from 'express'
import { UsecasesProxyModule } from '../../usecases-proxy/usecases-proxy.module'
import { UseCaseProxy } from '../../usecases-proxy/usecases-proxy'
import { LoginUseCases } from '../../../usecases/auth/login.usecases'
import { TokenPayload } from '../../../domain/model/auth'
import { ILogger, ILoggerToken } from '../../../domain/logger/logger.interface'
import {
  IException,
  IExceptionToken,
} from '../../../domain/exceptions/exceptions.interface'
import { JWTConfig, JWTConfigToken } from '../../../domain/config/jwt.interface'

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token'
) {
  constructor(
    @Inject(JWTConfigToken)
    jwtConfig: JWTConfig,
    @Inject(UsecasesProxyModule.LOGIN_USECASES_PROXY)
    private readonly loginUsecaseProxy: UseCaseProxy<LoginUseCases>,
    @Inject(ILoggerToken)
    private readonly logger: ILogger,
    @Inject(IExceptionToken)
    private readonly exceptionService: IException
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.Refresh
        },
      ]),
      secretOrKey: jwtConfig.getJwtRefreshSecret(),
      passReqToCallback: true,
    })
  }

  async validate(request: Request, payload: TokenPayload) {
    const refreshToken = request.cookies?.Refresh
    const user = await this.loginUsecaseProxy
      .getInstance()
      .getUserIfRefreshTokenMatches(refreshToken, payload.username)
    if (!user) {
      this.logger.warn('JwtStrategy', `User not found or hash not correct`)
      this.exceptionService.UnauthorizedException({
        message: 'User not found or hash not correct',
      })
    }
    return user
  }
}

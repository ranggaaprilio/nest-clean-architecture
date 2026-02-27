import { Module } from '@nestjs/common'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import { PassportModule } from '@nestjs/passport'
import { LoggerModule } from './infrastructure/logger/logger.module'
import { ExceptionsModule } from './infrastructure/exceptions/exceptions.module'
import { UsecasesProxyModule } from './infrastructure/usecases-proxy/usecases-proxy.module'
import { ControllersModule } from './infrastructure/controllers/controllers.module'
import { BcryptModule } from './infrastructure/services/bcrypt/bcrypt.module'
import { JwtModule as JwtServiceModule } from './infrastructure/services/jwt/jwt.module'
import { EnvironmentConfigModule } from './infrastructure/config/environment-config/environment-config.module'
import { LocalStrategy } from './infrastructure/common/strategies/local.strategy'
import { JwtStrategy } from './infrastructure/common/strategies/jwt.strategy'
import { JwtRefreshTokenStrategy } from './infrastructure/common/strategies/jwtRefresh.strategy'
import { WebsocketsModule } from './infrastructure/websockets/websockets.module'
import { AllExceptionFilter } from './infrastructure/common/filter/exception.filter'
import { LoggingInterceptor } from './infrastructure/common/interceptors/logger.interceptor'
import { ResponseInterceptor } from './infrastructure/common/interceptors/response.interceptor'
import { JSONAPIModule } from './infrastructure/common/jsonapi/jsonapi.module'

@Module({
  imports: [
    WebsocketsModule,
    PassportModule,
    LoggerModule,
    ExceptionsModule,
    UsecasesProxyModule.register(),
    ControllersModule,
    BcryptModule,
    JwtServiceModule,
    EnvironmentConfigModule,
    JSONAPIModule,
  ],
  providers: [
    LocalStrategy,
    JwtStrategy,
    JwtRefreshTokenStrategy,
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}

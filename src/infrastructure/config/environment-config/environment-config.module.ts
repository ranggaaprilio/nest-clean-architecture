import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { EnvironmentConfigService } from './environment-config.service'
import { validate } from './environment-config.validation'
import { JWTConfigToken } from '../../../domain/config/jwt.interface'
import { DatabaseConfigToken } from '../../../domain/config/database.interface'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './env/local.env',
      ignoreEnvFile:
        process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'test'
          ? false
          : true,
      isGlobal: true,
      validate,
    }),
  ],
  providers: [
    EnvironmentConfigService,
    {
      provide: JWTConfigToken,
      useExisting: EnvironmentConfigService,
    },
    {
      provide: DatabaseConfigToken,
      useExisting: EnvironmentConfigService,
    },
  ],
  exports: [EnvironmentConfigService, JWTConfigToken, DatabaseConfigToken],
})
export class EnvironmentConfigModule {}

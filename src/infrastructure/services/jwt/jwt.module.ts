import { Module } from '@nestjs/common'
import { JwtModule as Jwt } from '@nestjs/jwt'
import { JwtTokenService } from './jwt.service'
import { IJwtServiceToken } from '../../../domain/adapters/jwt.interface'
import { EnvironmentConfigModule } from '../../config/environment-config/environment-config.module'
import { EnvironmentConfigService } from '../../config/environment-config/environment-config.service'

@Module({
  imports: [
    EnvironmentConfigModule,
    Jwt.registerAsync({
      imports: [EnvironmentConfigModule],
      inject: [EnvironmentConfigService],
      useFactory: (config: EnvironmentConfigService) => ({
        secret: config.getJwtSecret(),
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  providers: [
    JwtTokenService,
    {
      provide: IJwtServiceToken,
      useExisting: JwtTokenService,
    },
  ],
  exports: [JwtTokenService, IJwtServiceToken],
})
export class JwtModule {}

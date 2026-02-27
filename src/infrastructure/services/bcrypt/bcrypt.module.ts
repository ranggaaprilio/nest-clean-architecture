import { Module } from '@nestjs/common'
import { BcryptService } from './bcrypt.service'
import { IBcryptServiceToken } from '../../../domain/adapters/bcrypt.interface'

@Module({
  providers: [
    BcryptService,
    {
      provide: IBcryptServiceToken,
      useExisting: BcryptService,
    },
  ],
  exports: [BcryptService, IBcryptServiceToken],
})
export class BcryptModule {}

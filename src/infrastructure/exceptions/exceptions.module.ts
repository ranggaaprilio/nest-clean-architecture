import { Module } from '@nestjs/common'
import { ExceptionsService } from './exceptions.service'
import { IExceptionToken } from '../../domain/exceptions/exceptions.interface'

@Module({
  providers: [
    ExceptionsService,
    {
      provide: IExceptionToken,
      useExisting: ExceptionsService,
    },
  ],
  exports: [ExceptionsService, IExceptionToken],
})
export class ExceptionsModule {}

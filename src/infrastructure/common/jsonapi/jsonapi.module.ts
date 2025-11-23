import { Module } from '@nestjs/common'
import { JSONAPIFormatter } from './jsonapi.formatter'

@Module({
  providers: [JSONAPIFormatter],
  exports: [JSONAPIFormatter],
})
export class JSONAPIModule {}

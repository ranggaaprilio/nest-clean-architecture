import { Module } from '@nestjs/common'
import { UsecasesProxyModule } from '../usecases-proxy/usecases-proxy.module'
import { AuthController } from './auth/auth.controller'
import { TodoController } from './todo/todo.controller'
import { CookieModule } from '../services/cookie/cookie.module'

@Module({
  imports: [UsecasesProxyModule.register(), CookieModule],
  controllers: [TodoController, AuthController],
})
export class ControllersModule {}

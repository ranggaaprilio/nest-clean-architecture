import { DynamicModule, Module } from '@nestjs/common'
import { AddTodoUseCases } from '../../usecases/todo/addTodo.usecases'
import { DeleteTodoUseCases } from '../../usecases/todo/deleteTodo.usecases'
import { GetTodoUseCases } from '../../usecases/todo/getTodo.usecases'
import { GetTodosUseCases } from '../../usecases/todo/getTodos.usecases'
import { UpdateTodoUseCases } from '../../usecases/todo/updateTodo.usecases'
import { IsAuthenticatedUseCases } from '../../usecases/auth/isAuthenticated.usecases'
import { LoginUseCases } from '../../usecases/auth/login.usecases'
import { LogoutUseCases } from '../../usecases/auth/logout.usecases'

import { ILogger, ILoggerToken } from '../../domain/logger/logger.interface'
import {
  IJwtService,
  IJwtServiceToken,
} from '../../domain/adapters/jwt.interface'
import {
  IBcryptService,
  IBcryptServiceToken,
} from '../../domain/adapters/bcrypt.interface'
import { JWTConfig, JWTConfigToken } from '../../domain/config/jwt.interface'
import {
  TodoRepository,
  TodoRepositoryToken,
} from '../../domain/repositories/todoRepository.interface'
import {
  UserRepository,
  UserRepositoryToken,
} from '../../domain/repositories/userRepository.interface'

import { ExceptionsModule } from '../exceptions/exceptions.module'
import { LoggerModule } from '../logger/logger.module'
import { BcryptModule } from '../services/bcrypt/bcrypt.module'
import { JwtModule } from '../services/jwt/jwt.module'
import { RepositoriesModule } from '../repositories/repositories.module'
import { EnvironmentConfigModule } from '../config/environment-config/environment-config.module'
import { UseCaseProxy } from './usecases-proxy'

@Module({
  imports: [
    LoggerModule,
    JwtModule,
    BcryptModule,
    EnvironmentConfigModule,
    RepositoriesModule,
    ExceptionsModule,
  ],
})
export class UsecasesProxyModule {
  // Auth
  static LOGIN_USECASES_PROXY = 'LoginUseCasesProxy'
  static IS_AUTHENTICATED_USECASES_PROXY = 'IsAuthenticatedUseCasesProxy'
  static LOGOUT_USECASES_PROXY = 'LogoutUseCasesProxy'

  static GET_TODO_USECASES_PROXY = 'getTodoUsecasesProxy'
  static GET_TODOS_USECASES_PROXY = 'getTodosUsecasesProxy'
  static POST_TODO_USECASES_PROXY = 'postTodoUsecasesProxy'
  static DELETE_TODO_USECASES_PROXY = 'deleteTodoUsecasesProxy'
  static PUT_TODO_USECASES_PROXY = 'putTodoUsecasesProxy'

  static register(): DynamicModule {
    return {
      module: UsecasesProxyModule,
      providers: [
        {
          inject: [
            ILoggerToken,
            IJwtServiceToken,
            JWTConfigToken,
            UserRepositoryToken,
            IBcryptServiceToken,
          ],
          provide: UsecasesProxyModule.LOGIN_USECASES_PROXY,
          useFactory: (
            logger: ILogger,
            jwtTokenService: IJwtService,
            config: JWTConfig,
            userRepo: UserRepository,
            bcryptService: IBcryptService
          ) =>
            new UseCaseProxy(
              new LoginUseCases(
                logger,
                jwtTokenService,
                config,
                userRepo,
                bcryptService
              )
            ),
        },
        {
          inject: [UserRepositoryToken],
          provide: UsecasesProxyModule.IS_AUTHENTICATED_USECASES_PROXY,
          useFactory: (userRepo: UserRepository) =>
            new UseCaseProxy(new IsAuthenticatedUseCases(userRepo)),
        },
        {
          inject: [],
          provide: UsecasesProxyModule.LOGOUT_USECASES_PROXY,
          useFactory: () => new UseCaseProxy(new LogoutUseCases()),
        },
        {
          inject: [TodoRepositoryToken],
          provide: UsecasesProxyModule.GET_TODO_USECASES_PROXY,
          useFactory: (todoRepository: TodoRepository) =>
            new UseCaseProxy(new GetTodoUseCases(todoRepository)),
        },
        {
          inject: [TodoRepositoryToken],
          provide: UsecasesProxyModule.GET_TODOS_USECASES_PROXY,
          useFactory: (todoRepository: TodoRepository) =>
            new UseCaseProxy(new GetTodosUseCases(todoRepository)),
        },
        {
          inject: [ILoggerToken, TodoRepositoryToken],
          provide: UsecasesProxyModule.POST_TODO_USECASES_PROXY,
          useFactory: (logger: ILogger, todoRepository: TodoRepository) =>
            new UseCaseProxy(new AddTodoUseCases(logger, todoRepository)),
        },
        {
          inject: [ILoggerToken, TodoRepositoryToken],
          provide: UsecasesProxyModule.PUT_TODO_USECASES_PROXY,
          useFactory: (logger: ILogger, todoRepository: TodoRepository) =>
            new UseCaseProxy(new UpdateTodoUseCases(logger, todoRepository)),
        },
        {
          inject: [ILoggerToken, TodoRepositoryToken],
          provide: UsecasesProxyModule.DELETE_TODO_USECASES_PROXY,
          useFactory: (logger: ILogger, todoRepository: TodoRepository) =>
            new UseCaseProxy(new DeleteTodoUseCases(logger, todoRepository)),
        },
      ],
      exports: [
        UsecasesProxyModule.GET_TODO_USECASES_PROXY,
        UsecasesProxyModule.GET_TODOS_USECASES_PROXY,
        UsecasesProxyModule.POST_TODO_USECASES_PROXY,
        UsecasesProxyModule.PUT_TODO_USECASES_PROXY,
        UsecasesProxyModule.DELETE_TODO_USECASES_PROXY,
        UsecasesProxyModule.LOGIN_USECASES_PROXY,
        UsecasesProxyModule.IS_AUTHENTICATED_USECASES_PROXY,
        UsecasesProxyModule.LOGOUT_USECASES_PROXY,
      ],
    }
  }
}

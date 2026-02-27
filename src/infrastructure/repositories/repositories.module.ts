import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TypeOrmConfigModule } from '../config/typeorm/typeorm.module'
import { Todo } from '../entities/todo.entity'
import { User } from '../entities/user.entity'
import { DatabaseTodoRepository } from './todo.repository'
import { DatabaseUserRepository } from './user.repository'
import { TodoRepositoryToken } from '../../domain/repositories/todoRepository.interface'
import { UserRepositoryToken } from '../../domain/repositories/userRepository.interface'

@Module({
  imports: [TypeOrmConfigModule, TypeOrmModule.forFeature([Todo, User])],
  providers: [
    DatabaseTodoRepository,
    DatabaseUserRepository,
    {
      provide: TodoRepositoryToken,
      useExisting: DatabaseTodoRepository,
    },
    {
      provide: UserRepositoryToken,
      useExisting: DatabaseUserRepository,
    },
  ],
  exports: [
    DatabaseTodoRepository,
    DatabaseUserRepository,
    TodoRepositoryToken,
    UserRepositoryToken,
  ],
})
export class RepositoriesModule {}

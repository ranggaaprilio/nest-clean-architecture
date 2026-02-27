import { TodoM } from '../model/todo'

export const TodoRepositoryToken = 'TodoRepository'

export interface TodoRepository {
  insert(todo: TodoM): Promise<TodoM>
  findAll(): Promise<TodoM[]>
  findById(id: number): Promise<TodoM>
  updateContent(id: number, isDone: boolean): Promise<void>
  deleteById(id: number): Promise<void>
}

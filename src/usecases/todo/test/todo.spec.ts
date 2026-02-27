import { TodoRepository } from './../../../domain/repositories/todoRepository.interface'
import { GetTodosUseCases } from '../getTodos.usecases'
import { GetTodoUseCases } from '../getTodo.usecases'
import { DeleteTodoUseCases } from '../deleteTodo.usecases'
import { AddTodoUseCases } from '../addTodo.usecases'
import { UpdateTodoUseCases } from '../updateTodo.usecases'
import { ILogger } from '../../../domain/logger/logger.interface'

describe('TodoUsecases', () => {
  let logger: ILogger
  let getTodosUseCases: GetTodosUseCases
  let getTodoUseCases: GetTodoUseCases
  let todoRepository: TodoRepository
  let deleteTodoUseCases: DeleteTodoUseCases
  let addTodoUseCases: AddTodoUseCases
  let updateTodoUseCases: UpdateTodoUseCases

  beforeEach(() => {
    // setup
    logger = {} as ILogger
    logger.log = jest.fn()
    todoRepository = {} as TodoRepository
    todoRepository.findAll = jest.fn()
    todoRepository.findById = jest.fn()
    todoRepository.deleteById = jest.fn()
    todoRepository.insert = jest.fn()
    todoRepository.updateContent = jest.fn()
    getTodosUseCases = new GetTodosUseCases(todoRepository)
    getTodoUseCases = new GetTodoUseCases(todoRepository)
    deleteTodoUseCases = new DeleteTodoUseCases(logger, todoRepository)
    addTodoUseCases = new AddTodoUseCases(logger, todoRepository)
    updateTodoUseCases = new UpdateTodoUseCases(logger, todoRepository)
  })

  describe('GetTodosUseCases', () => {
    it('should return all todos', async () => {
      // given
      const todos = [{ id: 1, content: 'todo1', isDone: false }]
      ;(todoRepository.findAll as jest.Mock).mockReturnValue(todos)

      // when
      const result = await getTodosUseCases.execute()

      // then
      expect(result).toEqual(todos)
    })
  })

  describe('GetTodoUseCases', () => {
    it('should return a todo', async () => {
      // given
      const todo = { id: 1, content: 'todo1', isDone: false }
      ;(todoRepository.findById as jest.Mock).mockReturnValue(todo)

      // when
      const result = await getTodoUseCases.execute(1)

      // then
      expect(result).toEqual(todo)
    })

    it('should throw an error when todo not found', async () => {
      // given
      ;(todoRepository.findById as jest.Mock).mockReturnValue(null)

      // when
      try {
        await getTodoUseCases.execute(1)
      } catch (e) {
        // then
        expect(e.message).toBe('Todo not found')
      }
    })
  })

  describe('DeleteTodoUseCases', () => {
    it('should delete a todo', async () => {
      // when
      await deleteTodoUseCases.execute(1)

      // then
      expect(todoRepository.deleteById).toHaveBeenCalledWith(1)
    })
  })

  describe('AddTodoUseCases', () => {
    it('should add a todo', async () => {
      // given
      const todo = { id: 1, content: 'todo1', isDone: false }
      ;(todoRepository.insert as jest.Mock).mockReturnValue(todo)

      // when
      const result = await addTodoUseCases.execute('todo1')

      // then
      expect(result).toEqual(todo)
    })
  })

  describe('UpdateTodoUseCases', () => {
    it('should update a todo', async () => {
      // when
      await updateTodoUseCases.execute(1, true)

      // then
      expect(todoRepository.updateContent).toHaveBeenCalledWith(1, true)
    })
  })
})

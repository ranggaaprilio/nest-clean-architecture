import { Test, TestingModule } from '@nestjs/testing'
import { WebsocketsGateway } from './websockets.gateway'
import { ILoggerToken } from '../../domain/logger/logger.interface'

const mockLogger = {
  log: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  verbose: jest.fn(),
}

describe('WebsocketsGateway', () => {
  let gateway: WebsocketsGateway

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebsocketsGateway,
        { provide: ILoggerToken, useValue: mockLogger },
      ],
    }).compile()

    gateway = module.get<WebsocketsGateway>(WebsocketsGateway)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(gateway).toBeDefined()
  })

  it('should return pong event with same data on ping', () => {
    const mockClient = { id: 'test-client-id' } as any
    const data = 'Hello world!'

    const result = gateway.handleMessage(mockClient, data)

    expect(result).toEqual({ event: 'pong', data: 'Hello world!' })
    expect(mockLogger.log).toHaveBeenCalledWith(
      'WebsocketsGateway',
      'Message received from client id: test-client-id'
    )
    expect(mockLogger.debug).toHaveBeenCalledWith(
      'WebsocketsGateway',
      'Payload: Hello world!'
    )
  })

  it('should log on client connection', () => {
    const mockClient = { id: 'test-client-id' } as any
    const mockSockets = new Map()
    mockSockets.set('test-client-id', mockClient)
    gateway.io = { sockets: { sockets: mockSockets } } as any

    gateway.handleConnection(mockClient)

    expect(mockLogger.log).toHaveBeenCalledWith(
      'WebsocketsGateway',
      'Client id: test-client-id connected'
    )
    expect(mockLogger.debug).toHaveBeenCalledWith(
      'WebsocketsGateway',
      'Number of connected clients: 1'
    )
  })

  it('should log on client disconnection', () => {
    const mockClient = { id: 'test-client-id' } as any

    gateway.handleDisconnect(mockClient)

    expect(mockLogger.log).toHaveBeenCalledWith(
      'WebsocketsGateway',
      'Cliend id:test-client-id disconnected'
    )
  })
})

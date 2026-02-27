import supertest from 'supertest'
import { Test } from '@nestjs/testing'
import { ExecutionContext, INestApplication } from '@nestjs/common'
import cookieParser from 'cookie-parser'
import { UseCaseProxy } from '../src/infrastructure/usecases-proxy/usecases-proxy'
import { UsecasesProxyModule } from '../src/infrastructure/usecases-proxy/usecases-proxy.module'
import { LoginUseCases } from '../src/usecases/auth/login.usecases'
import { IsAuthenticatedUseCases } from '../src/usecases/auth/isAuthenticated.usecases'
import { AppModule } from '../src/app.module'
import { JwtAuthGuard } from '../src/infrastructure/common/guards/jwtAuth.guard'
import JwtRefreshGuard from '../src/infrastructure/common/guards/jwtRefresh.guard'

describe('infrastructure/controllers/auth', () => {
  let app: INestApplication
  let loginUseCase: LoginUseCases
  let isAuthenticatedUseCases: IsAuthenticatedUseCases

  beforeAll(async () => {
    loginUseCase = {} as LoginUseCases
    loginUseCase.getJwtToken = jest.fn()
    loginUseCase.validateUserForLocalStragtegy = jest.fn()
    loginUseCase.getJwtRefreshToken = jest.fn()
    const loginUsecaseProxyService: UseCaseProxy<LoginUseCases> = {
      getInstance: () => loginUseCase,
    } as UseCaseProxy<LoginUseCases>

    isAuthenticatedUseCases = {} as IsAuthenticatedUseCases
    isAuthenticatedUseCases.execute = jest.fn()
    const isAuthUsecaseProxyService: UseCaseProxy<IsAuthenticatedUseCases> = {
      getInstance: () => isAuthenticatedUseCases,
    } as UseCaseProxy<IsAuthenticatedUseCases>

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UsecasesProxyModule.IS_AUTHENTICATED_USECASES_PROXY)
      .useValue(isAuthUsecaseProxyService)
      .overrideProvider(UsecasesProxyModule.LOGIN_USECASES_PROXY)
      .useValue(loginUsecaseProxyService)
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate(context: ExecutionContext) {
          const req = context.switchToHttp().getRequest()
          req.user = { username: 'username' }
          return (
            JSON.stringify(req.cookies) ===
            JSON.stringify({
              Authentication: '123456',
              Path: '/',
              'Max-Age': '1800',
            })
          )
        },
      })
      .overrideGuard(JwtRefreshGuard)
      .useValue({
        canActivate(context: ExecutionContext) {
          const req = context.switchToHttp().getRequest()
          req.user = { username: 'username' }
          return true
        },
      })
      .compile()

    app = moduleRef.createNestApplication()
    app.use(cookieParser())
    await app.init()
  })

  it(`/POST login should return 201`, async () => {
    const createDate = new Date().toISOString()
    const updatedDate = new Date().toISOString()
    ;(loginUseCase.validateUserForLocalStragtegy as jest.Mock).mockReturnValue(
      Promise.resolve({
        id: 1,
        username: 'username',
        createDate: createDate,
        updatedDate: updatedDate,
        lastLogin: null,
        hashRefreshToken: null,
      })
    )
    ;(loginUseCase.getJwtToken as jest.Mock).mockReturnValue(
      Promise.resolve({ token: '123456', expiresIn: '1800' })
    )
    ;(loginUseCase.getJwtRefreshToken as jest.Mock).mockReturnValue(
      Promise.resolve({ token: '12345', expiresIn: '86400' })
    )

    const result = await supertest(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ username: 'username', password: 'password' })
      .expect(201)

    expect(result.headers['set-cookie']).toEqual([
      `Authentication=123456; HttpOnly; Path=/; Max-Age=1800`,
      `Refresh=12345; HttpOnly; Path=/; Max-Age=86400`,
    ])
  })

  it(`/POST logout should return 201`, async () => {
    const result = await supertest(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Cookie', ['Authentication=123456; HttpOnly; Path=/; Max-Age=1800'])
      .send()
      .expect(201)

    expect(result.headers['set-cookie']).toEqual([
      'Authentication=; HttpOnly; Path=/; Max-Age=0',
      'Refresh=; HttpOnly; Path=/; Max-Age=0',
    ])
  })

  it(`/POST login should return 401`, async () => {
    ;(loginUseCase.validateUserForLocalStragtegy as jest.Mock).mockReturnValue(
      Promise.resolve(null)
    )

    await supertest(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ username: 'username', password: 'password' })
      .expect(401)
  })

  it(`/POST Refresh token should return 200`, async () => {
    ;(loginUseCase.getJwtToken as jest.Mock).mockReturnValue(
      Promise.resolve({ token: '123456', expiresIn: '1800' })
    )

    const result = await supertest(app.getHttpServer())
      .get('/api/v1/auth/refresh')
      .send()
      .expect(200)

    expect(result.headers['set-cookie']).toEqual([
      `Authentication=123456; HttpOnly; Path=/; Max-Age=1800`,
    ])
  })

  it(`/GET is_authenticated should return 200`, async () => {
    ;(isAuthenticatedUseCases.execute as jest.Mock).mockReturnValue(
      Promise.resolve({ username: 'username' })
    )

    await supertest(app.getHttpServer())
      .get('/api/v1/auth/is_authenticated')
      .set('Cookie', ['Authentication=123456; HttpOnly; Path=/; Max-Age=1800'])
      .send()
      .expect(200)
  })

  it(`/GET is_authenticated should return 403`, async () => {
    ;(isAuthenticatedUseCases.execute as jest.Mock).mockReturnValue(
      Promise.resolve({ username: 'username' })
    )

    await supertest(app.getHttpServer())
      .get('/api/v1/auth/is_authenticated')
      .send()
      .expect(403)
  })

  afterAll(async () => {
    await app.close()
  })
})

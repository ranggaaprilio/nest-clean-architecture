import { IBcryptService } from '../../../domain/adapters/bcrypt.interface'
import { IJwtService } from '../../../domain/adapters/jwt.interface'
import { JWTConfig } from '../../../domain/config/jwt.interface'
import { ILogger } from '../../../domain/logger/logger.interface'
import { UserM } from '../../../domain/model/user'
import { UserRepository } from '../../../domain/repositories/userRepository.interface'
import { IsAuthenticatedUseCases } from '../isAuthenticated.usecases'
import { LoginUseCases } from '../login.usecases'
import { LogoutUseCases } from '../logout.usecases'

function createUserM(overrides: Partial<UserM> = {}): UserM {
  const user = new UserM()
  user.id = overrides.id ?? 1
  user.username = overrides.username ?? 'username'
  user.password = overrides.password ?? 'password'
  user.createDate = overrides.createDate ?? new Date()
  user.updatedDate = overrides.updatedDate ?? new Date()
  user.lastLogin = overrides.lastLogin ?? null
  user.hashRefreshToken = overrides.hashRefreshToken ?? 'refresh token'
  return user
}

describe('uses_cases/authentication', () => {
  let loginUseCases: LoginUseCases
  let logoutUseCases: LogoutUseCases
  let isAuthenticated: IsAuthenticatedUseCases
  let logger: ILogger
  let jwtService: IJwtService
  let jwtConfig: JWTConfig
  let adminUserRepo: UserRepository
  let bcryptService: IBcryptService

  beforeEach(() => {
    logger = {} as ILogger
    logger.log = jest.fn()

    jwtService = {} as IJwtService
    jwtService.createToken = jest.fn()

    jwtConfig = {} as JWTConfig
    jwtConfig.getJwtExpirationTime = jest.fn()
    jwtConfig.getJwtSecret = jest.fn()
    jwtConfig.getJwtRefreshSecret = jest.fn()
    jwtConfig.getJwtRefreshExpirationTime = jest.fn()

    adminUserRepo = {} as UserRepository
    adminUserRepo.getUserByUsername = jest.fn()
    adminUserRepo.updateLastLogin = jest.fn()
    adminUserRepo.updateRefreshToken = jest.fn()

    bcryptService = {} as IBcryptService
    bcryptService.compare = jest.fn()
    bcryptService.hash = jest.fn()

    loginUseCases = new LoginUseCases(
      logger,
      jwtService,
      jwtConfig,
      adminUserRepo,
      bcryptService
    )
    logoutUseCases = new LogoutUseCases()
    isAuthenticated = new IsAuthenticatedUseCases(adminUserRepo)
  })

  describe('creating a token', () => {
    it('should return a token result', async () => {
      const expiresIn = '200'
      const token = 'token'
      ;(jwtConfig.getJwtSecret as jest.Mock).mockReturnValue('secret')
      ;(jwtConfig.getJwtExpirationTime as jest.Mock).mockReturnValue(expiresIn)
      ;(jwtService.createToken as jest.Mock).mockReturnValue(token)

      expect(await loginUseCases.getJwtToken('username')).toEqual({
        token,
        expiresIn,
      })
    })
    it('should return a refresh token result', async () => {
      const expiresIn = '200'
      const token = 'token'
      ;(jwtConfig.getJwtRefreshSecret as jest.Mock).mockReturnValue('secret')
      ;(jwtConfig.getJwtRefreshExpirationTime as jest.Mock).mockReturnValue(
        expiresIn
      )
      ;(jwtService.createToken as jest.Mock).mockReturnValue(token)
      ;(bcryptService.hash as jest.Mock).mockReturnValue(
        Promise.resolve('hashed password')
      )
      ;(adminUserRepo.updateRefreshToken as jest.Mock).mockReturnValue(
        Promise.resolve(null)
      )

      expect(await loginUseCases.getJwtRefreshToken('username')).toEqual({
        token,
        expiresIn,
      })
      expect(adminUserRepo.updateRefreshToken).toBeCalledTimes(1)
    })
  })

  describe('validation local strategy', () => {
    it('should return null because user not found', async () => {
      ;(adminUserRepo.getUserByUsername as jest.Mock).mockReturnValue(
        Promise.resolve(null)
      )

      expect(
        await loginUseCases.validateUserForLocalStragtegy(
          'username',
          'password'
        )
      ).toEqual(null)
    })
    it('should return null because wrong password', async () => {
      const user = createUserM()
      ;(adminUserRepo.getUserByUsername as jest.Mock).mockReturnValue(
        Promise.resolve(user)
      )
      ;(bcryptService.compare as jest.Mock).mockReturnValue(
        Promise.resolve(false)
      )

      expect(
        await loginUseCases.validateUserForLocalStragtegy(
          'username',
          'password'
        )
      ).toEqual(null)
    })
    it('should return user without password', async () => {
      const user = createUserM()
      ;(adminUserRepo.getUserByUsername as jest.Mock).mockReturnValue(
        Promise.resolve(user)
      )
      ;(bcryptService.compare as jest.Mock).mockReturnValue(
        Promise.resolve(true)
      )

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = user

      expect(
        await loginUseCases.validateUserForLocalStragtegy(
          'username',
          'password'
        )
      ).toEqual(rest)
    })
  })

  describe('Validation jwt strategy', () => {
    it('should return null because user not found', async () => {
      ;(adminUserRepo.getUserByUsername as jest.Mock).mockReturnValue(
        Promise.resolve(null)
      )
      ;(bcryptService.compare as jest.Mock).mockReturnValue(
        Promise.resolve(false)
      )

      expect(
        await loginUseCases.validateUserForJWTStragtegy('username')
      ).toEqual(null)
    })

    it('should return user', async () => {
      const user = createUserM()
      ;(adminUserRepo.getUserByUsername as jest.Mock).mockReturnValue(
        Promise.resolve(user)
      )

      expect(
        await loginUseCases.validateUserForJWTStragtegy('username')
      ).toEqual(user)
    })
  })

  describe('Validation refresh token', () => {
    it('should return null because user not found', async () => {
      ;(adminUserRepo.getUserByUsername as jest.Mock).mockReturnValue(
        Promise.resolve(null)
      )

      expect(
        await loginUseCases.getUserIfRefreshTokenMatches(
          'refresh token',
          'username'
        )
      ).toEqual(null)
    })

    it('should return null because refresh token does not match', async () => {
      const user = createUserM()
      ;(adminUserRepo.getUserByUsername as jest.Mock).mockReturnValue(
        Promise.resolve(user)
      )
      ;(bcryptService.compare as jest.Mock).mockReturnValue(
        Promise.resolve(false)
      )

      expect(
        await loginUseCases.getUserIfRefreshTokenMatches(
          'refresh token',
          'username'
        )
      ).toEqual(null)
    })

    it('should return user', async () => {
      const user = createUserM()
      ;(adminUserRepo.getUserByUsername as jest.Mock).mockReturnValue(
        Promise.resolve(user)
      )
      ;(bcryptService.compare as jest.Mock).mockReturnValue(
        Promise.resolve(true)
      )

      expect(
        await loginUseCases.getUserIfRefreshTokenMatches(
          'refresh token',
          'username'
        )
      ).toEqual(user)
    })
  })

  describe('logout', () => {
    it('should return void', async () => {
      expect(await logoutUseCases.execute()).toBeUndefined()
    })
  })

  describe('isAuthenticated', () => {
    it('should return user without password', async () => {
      const user = createUserM()
      ;(adminUserRepo.getUserByUsername as jest.Mock).mockReturnValue(
        Promise.resolve(user)
      )

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = user

      expect(await isAuthenticated.execute('username')).toEqual(rest)
    })
  })
})

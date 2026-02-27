import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  Request,
  UseGuards,
  Version,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'

import { AuthLoginDto } from './auth-dto.class'
import { IsAuthPresenter } from './auth.presenter'

import JwtRefreshGuard from '../../common/guards/jwtRefresh.guard'
import { JwtAuthGuard } from '../../common/guards/jwtAuth.guard'
import { LoginGuard } from '../../common/guards/login.guard'

import { UseCaseProxy } from '../../usecases-proxy/usecases-proxy'
import { UsecasesProxyModule } from '../../usecases-proxy/usecases-proxy.module'
import { LoginUseCases } from '../../../usecases/auth/login.usecases'
import { IsAuthenticatedUseCases } from '../../../usecases/auth/isAuthenticated.usecases'
import { LogoutUseCases } from '../../../usecases/auth/logout.usecases'

import { ApiResponseType } from '../../common/swagger/response.decorator'
import { CookieService } from '../../services/cookie/cookie.service'

@Controller('auth')
@ApiTags('auth')
@ApiResponse({
  status: 401,
  description: 'No authorization token was found',
})
@ApiResponse({ status: 500, description: 'Internal error' })
@ApiExtraModels(IsAuthPresenter)
export class AuthController {
  constructor(
    @Inject(UsecasesProxyModule.LOGIN_USECASES_PROXY)
    private readonly loginUsecaseProxy: UseCaseProxy<LoginUseCases>,
    @Inject(UsecasesProxyModule.LOGOUT_USECASES_PROXY)
    private readonly logoutUsecaseProxy: UseCaseProxy<LogoutUseCases>,
    @Inject(UsecasesProxyModule.IS_AUTHENTICATED_USECASES_PROXY)
    private readonly isAuthUsecaseProxy: UseCaseProxy<IsAuthenticatedUseCases>,
    private readonly cookieService: CookieService
  ) {}

  @Version('1')
  @Post('login')
  @UseGuards(LoginGuard)
  @ApiBearerAuth()
  @ApiBody({ type: AuthLoginDto })
  @ApiOperation({ description: 'login' })
  async login(@Body() auth: AuthLoginDto, @Request() request: any) {
    const accessToken = await this.loginUsecaseProxy
      .getInstance()
      .getJwtToken(auth.username)
    const refreshToken = await this.loginUsecaseProxy
      .getInstance()
      .getJwtRefreshToken(auth.username)
    request.res.setHeader('Set-Cookie', [
      this.cookieService.formatAccessTokenCookie(accessToken),
      this.cookieService.formatRefreshTokenCookie(refreshToken),
    ])
    return 'Login successful'
  }

  @Version('1')
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ description: 'logout' })
  async logout(@Request() request: any) {
    await this.logoutUsecaseProxy.getInstance().execute()
    request.res.setHeader('Set-Cookie', this.cookieService.getClearCookies())
    return 'Logout successful'
  }

  @Version('1')
  @Get('is_authenticated')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ description: 'is_authenticated' })
  @ApiResponseType(IsAuthPresenter, false)
  async isAuthenticated(@Req() request: any) {
    const user = await this.isAuthUsecaseProxy
      .getInstance()
      .execute(request.user.username)
    const response = new IsAuthPresenter()
    response.username = user.username
    return response
  }

  @Version('1')
  @Get('refresh')
  @UseGuards(JwtRefreshGuard)
  @ApiBearerAuth()
  async refresh(@Req() request: any) {
    const accessToken = await this.loginUsecaseProxy
      .getInstance()
      .getJwtToken(request.user.username)
    request.res.setHeader(
      'Set-Cookie',
      this.cookieService.formatAccessTokenCookie(accessToken)
    )
    return 'Refresh successful'
  }
}

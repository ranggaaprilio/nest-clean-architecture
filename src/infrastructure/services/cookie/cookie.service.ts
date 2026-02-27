import { Injectable } from '@nestjs/common'
import { TokenResult } from '../../../usecases/auth/login.usecases'

@Injectable()
export class CookieService {
  formatAccessTokenCookie(tokenResult: TokenResult): string {
    return `Authentication=${tokenResult.token}; HttpOnly; Path=/; Max-Age=${tokenResult.expiresIn}`
  }

  formatRefreshTokenCookie(tokenResult: TokenResult): string {
    return `Refresh=${tokenResult.token}; HttpOnly; Path=/; Max-Age=${tokenResult.expiresIn}`
  }

  getClearCookies(): string[] {
    return [
      'Authentication=; HttpOnly; Path=/; Max-Age=0',
      'Refresh=; HttpOnly; Path=/; Max-Age=0',
    ]
  }
}

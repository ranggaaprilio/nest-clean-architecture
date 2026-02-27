export const JWTConfigToken = 'JWTConfig'

export interface JWTConfig {
  getJwtSecret(): string
  getJwtExpirationTime(): string
  getJwtRefreshSecret(): string
  getJwtRefreshExpirationTime(): string
}

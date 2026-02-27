import { UserM } from '../model/user'

export const UserRepositoryToken = 'UserRepository'

export interface UserRepository {
  getUserByUsername(username: string): Promise<UserM | null>
  updateLastLogin(username: string): Promise<void>
  updateRefreshToken(username: string, refreshToken: string): Promise<void>
}

export const IBcryptServiceToken = 'IBcryptService'

export interface IBcryptService {
  hash(hashString: string): Promise<string>
  compare(password: string, hashPassword: string): Promise<boolean>
}

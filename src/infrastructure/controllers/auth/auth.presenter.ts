import { ApiProperty } from '@nestjs/swagger'

export class IsAuthPresenter {
  @ApiProperty()
  username: string

  toJSONAPI() {
    return {
      type: 'auth',
      id: '1',
      attributes: {
        username: this.username,
      },
    }
  }
}

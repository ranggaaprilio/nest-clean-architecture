import { MigrationInterface, QueryRunner } from 'typeorm'

export class RenameHachRefreshToken1716092227393 implements MigrationInterface {
  name = 'RenameHachRefreshToken1716092227393'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "hach_refresh_token" TO "hash_refresh_token"`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "hash_refresh_token" TO "hach_refresh_token"`
    )
  }
}

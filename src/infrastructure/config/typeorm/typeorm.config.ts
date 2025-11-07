import { DataSourceOptions, DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
import { registerAs } from '@nestjs/config'
// import path, { join } from 'path'

// if (process.env.NODE_ENV === "local") {
//   dotenv.config({ path: "./env/local.env" });
// }

dotenv.config({ path: '.env' })

const config = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  logging: true,
  migrations: [__dirname + '/../../database/migrations/**/*{.ts,.js}'],
  synchronize: false,
  migrationsTableName: 'typeorm_migrations',
  migrationsRun: false,
  // ssl: {
  //   rejectUnauthorized: false,
  // },
}

export default registerAs('typeorm', () => config)
export const connectionSource = new DataSource(config as DataSourceOptions)

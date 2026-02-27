import { Module } from '@nestjs/common'
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm'
import { EnvironmentConfigModule } from '../environment-config/environment-config.module'
import { EnvironmentConfigService } from '../environment-config/environment-config.service'

export const getTypeOrmModuleOptions = (
  config: EnvironmentConfigService
): TypeOrmModuleOptions =>
  ({
    type: 'postgres',
    host: config.getDatabaseHost(),
    port: config.getDatabasePort(),
    username: config.getDatabaseUser(),
    password: config.getDatabasePassword(),
    database: config.getDatabaseName(),
    entities: [__dirname + './../../**/*.entity{.ts,.js}'],
    migrations: ['./database/migrations/**/*{.ts,.js}'],
    synchronize: false,
    schema: config.getDatabaseSchema(),
    logging: true,
    migrationsTableName: 'typeorm_migrations',
    migrationsRun: false,
  }) as TypeOrmModuleOptions

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [EnvironmentConfigModule],
      inject: [EnvironmentConfigService],
      useFactory: getTypeOrmModuleOptions,
    }),
  ],
})
export class TypeOrmConfigModule {}

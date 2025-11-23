import { ValidationPipe, VersioningType } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import cookieParser from 'cookie-parser'
import { AppModule } from './app.module'
import { AllExceptionFilter } from './infrastructure/common/filter/exception.filter'
import { LoggingInterceptor } from './infrastructure/common/interceptors/logger.interceptor'
import { ResponseInterceptor } from './infrastructure/common/interceptors/response.interceptor'
import { LoggerService } from './infrastructure/logger/logger.service'

async function bootstrap() {
  const env = process.env.NODE_ENV
  const app = await NestFactory.create(AppModule)

  app.use(cookieParser())

  // Filter
  app.useGlobalFilters(new AllExceptionFilter(new LoggerService()))

  // pipes
  app.useGlobalPipes(new ValidationPipe())

  // interceptors
  app.useGlobalInterceptors(new LoggingInterceptor(new LoggerService()))
  app.useGlobalInterceptors(new ResponseInterceptor())

  // base routing
  app.setGlobalPrefix('api')

  //add versioning
  app.enableVersioning({ type: VersioningType.URI, prefix: 'v' })

  app.enableCors()

  // swagger config
  if (env !== 'production') {
    const config = new DocumentBuilder()
      .addBearerAuth()
      .setTitle('Clean Architecture Nestjs')
      .setDescription('Example with todo list')
      .setVersion('1.0')
      .build()
    const document = SwaggerModule.createDocument(app, config, {
      deepScanRoutes: true,
    })
    SwaggerModule.setup('docs', app, document)
  }

  await app.listen(3000)
}
bootstrap()

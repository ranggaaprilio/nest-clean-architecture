# NestJS Clean Architecture - GitHub Copilot Instructions

## Project Overview

This is a NestJS application following **Clean Architecture** principles with clear separation of concerns across three main layers:

1. **Domain Layer** (`src/domain/`) - Business logic and interfaces
2. **Use Cases Layer** (`src/usecases/`) - Application-specific business rules
3. **Infrastructure Layer** (`src/infrastructure/`) - External frameworks, databases, and delivery mechanisms

## Architecture Principles

### Clean Architecture Layers

```
┌─────────────────────────────────────────┐
│         Infrastructure Layer            │
│  (Controllers, DB, External Services)   │
├─────────────────────────────────────────┤
│          Use Cases Layer                │
│     (Application Business Rules)        │
├─────────────────────────────────────────┤
│           Domain Layer                  │
│    (Enterprise Business Rules)          │
└─────────────────────────────────────────┘
```

**Dependency Rule**: Dependencies only flow inward. Domain has no dependencies. Use Cases depend only on Domain. Infrastructure depends on both.

## Project Structure Guide

### Domain Layer (`src/domain/`)

**Purpose**: Contains enterprise business rules, entities, and interfaces

- **`model/`**: Domain entities (pure TypeScript classes)
  - `user.ts`, `todo.ts`, `auth.ts`
  - No framework dependencies
  - Pure business logic

- **`repositories/`**: Repository interfaces
  - Define contracts for data access
  - Implemented in infrastructure layer

- **`adapters/`**: Adapter interfaces for external services
  - `bcrypt.interface.ts`, `jwt.interface.ts`
  - Define contracts, not implementations

- **`config/`**: Configuration interfaces
  - `database.interface.ts`, `jwt.interface.ts`

- **`logger/`** & **`exceptions/`**: Cross-cutting concern interfaces

### Use Cases Layer (`src/usecases/`)

**Purpose**: Application-specific business rules and orchestration

- Each feature has its own directory (e.g., `auth/`, `todo/`)
- Use cases implement specific user stories
- Examples:
  - `login.usecases.ts` - Handle user authentication
  - `addTodo.usecases.ts` - Create new todo items
  - `getTodos.usecases.ts` - Retrieve todo lists

**Use Case Pattern**:
```typescript
export class ExampleUseCases {
  constructor(
    private readonly repository: IRepository,
    private readonly logger: ILogger,
  ) {}

  async execute(input: InputDto): Promise<OutputDto> {
    // Business logic here
    this.logger.log('ExampleUseCases execute', 'Use case executed');
    return await this.repository.someMethod(input);
  }
}
```

### Infrastructure Layer (`src/infrastructure/`)

**Purpose**: Framework-specific implementations and external service integrations

#### Controllers (`infrastructure/controllers/`)
- REST API endpoints using NestJS decorators
- Organized by feature (auth, todo, etc.)
- Use **Presenters** to format responses
- Return JSON:API formatted responses

**Controller Pattern**:
```typescript
@Controller('api/v1/resource')
export class ResourceController {
  constructor(
    @Inject(UsecasesProxyModule.USE_CASE_PROXY)
    private readonly useCaseProxy: UseCaseProxy<UseCaseClass>,
  ) {}

  @Get()
  @ApiResponseType(ResponsePresenter, true)
  async getAll() {
    const result = await this.useCaseProxy.getInstance().execute();
    return ResponsePresenter.from(result);
  }
}
```

#### Repositories (`infrastructure/repositories/`)
- Implement domain repository interfaces
- Use TypeORM for database operations
- Map between entities and domain models

#### Services (`infrastructure/services/`)
- Implement domain adapter interfaces
- `bcrypt/` - Password hashing service
- `jwt/` - Token generation and validation

#### Common (`infrastructure/common/`)
- **Guards**: `jwtAuth.guard.ts`, `jwtRefresh.guard.ts`, `login.guard.ts`
- **Strategies**: Passport strategies for authentication
- **Interceptors**: Response formatting, logging
- **Filters**: Global exception handling
- **Swagger**: API documentation decorators
- **JSON:API**: API response formatting module

#### Config (`infrastructure/config/`)
- **environment-config/**: Environment variable management
- **typeorm/**: Database configuration and module setup

#### Entities (`infrastructure/entities/`)
- TypeORM entities (database schema)
- Separate from domain models
- `user.entity.ts`, `todo.entity.ts`

#### UseCases Proxy (`infrastructure/usecases-proxy/`)
- **Dependency Injection** for use cases
- Registers use cases with their dependencies
- Provides use case instances to controllers

**UseCases Proxy Pattern**:
```typescript
@Module({
  imports: [
    LoggerModule,
    RepositoriesModule,
    // other dependencies
  ],
})
export class UsecasesProxyModule {
  static USE_CASE_NAME = 'UseCaseNameUseCaseProxy';

  @Module({
    providers: [
      {
        inject: [LoggerService, RepositoryService],
        provide: UsecasesProxyModule.USE_CASE_NAME,
        useFactory: (logger: LoggerService, repo: RepositoryService) =>
          new UsecaseProxy(new UseCaseClass(repo, logger)),
      },
    ],
    exports: [UsecasesProxyModule.USE_CASE_NAME],
  })
  static register(): DynamicModule {
    return {
      module: UsecasesProxyModule,
      providers: [/* providers here */],
      exports: [/* exports here */],
    };
  }
}
```

## Coding Conventions

### 1. Dependency Injection
- Use constructor injection for all dependencies
- Inject interfaces, not concrete implementations
- Use `@Inject()` decorator for custom providers

### 2. Naming Conventions
- **Use Cases**: `{action}{Entity}.usecases.ts` (e.g., `getTodo.usecases.ts`)
- **Controllers**: `{entity}.controller.ts`
- **Entities**: `{entity}.entity.ts` (TypeORM) vs `{entity}.ts` (Domain)
- **Interfaces**: Prefix with `I` (e.g., `ILogger`, `IJwtService`)
- **Presenters**: `{entity}.presenter.ts`

### 3. Module Organization
- Each feature has its own module
- Import only what's needed
- Use `forwardRef()` for circular dependencies

### 4. DTOs and Validation
- Use `class-validator` decorators
- Separate DTOs for request and response
- Located in controller directories (e.g., `auth-dto.class.ts`)

### 5. Error Handling
- Use custom exception service (`infrastructure/exceptions/`)
- Throw domain-appropriate exceptions
- Global exception filter formats errors

### 6. Logging
- Use logger service, not `console.log`
- Log format: `this.logger.log(context, message)`
- Available in all layers via dependency injection

### 7. Authentication & Authorization
- JWT-based authentication with refresh tokens
- Use guards: `@UseGuards(JwtAuthGuard)`
- Local strategy for login, JWT strategy for protected routes

### 8. API Response Format
- Use JSON:API specification
- Responses formatted via presenters
- Use `@ApiResponseType()` decorator for Swagger

### 9. Testing
- Unit tests alongside use cases (`test/` subdirectories)
- E2E tests in root `test/` directory
- Mock repositories and services in tests

## When Creating New Features

### 1. Domain Layer First
```typescript
// 1. Create domain model (src/domain/model/)
export class NewEntity {
  id: number;
  name: string;
  // business logic methods
}

// 2. Create repository interface (src/domain/repositories/)
export interface INewEntityRepository {
  findAll(): Promise<NewEntity[]>;
  findById(id: number): Promise<NewEntity>;
  // other methods
}
```

### 2. Use Cases Layer
```typescript
// 3. Create use cases (src/usecases/newentity/)
export class GetNewEntitiesUseCases {
  constructor(
    private readonly repository: INewEntityRepository,
    private readonly logger: ILogger,
  ) {}

  async execute(): Promise<NewEntity[]> {
    this.logger.log('GetNewEntitiesUseCases execute', 'Getting all entities');
    return await this.repository.findAll();
  }
}
```

### 3. Infrastructure Layer
```typescript
// 4. Create TypeORM entity (src/infrastructure/entities/)
@Entity('new_entities')
export class NewEntityEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}

// 5. Implement repository (src/infrastructure/repositories/)
@Injectable()
export class NewEntityRepository implements INewEntityRepository {
  constructor(
    @InjectRepository(NewEntityEntity)
    private readonly repository: Repository<NewEntityEntity>,
  ) {}

  async findAll(): Promise<NewEntity[]> {
    const entities = await this.repository.find();
    return entities.map(entity => this.toNewEntity(entity));
  }

  private toNewEntity(entity: NewEntityEntity): NewEntity {
    // Map TypeORM entity to domain model
  }
}

// 6. Create presenter (src/infrastructure/controllers/newentity/)
export class NewEntityPresenter {
  id: number;
  name: string;

  static from(entity: NewEntity): NewEntityPresenter {
    const presenter = new NewEntityPresenter();
    presenter.id = entity.id;
    presenter.name = entity.name;
    return presenter;
  }
}

// 7. Create controller (src/infrastructure/controllers/newentity/)
@Controller('api/v1/newentities')
export class NewEntityController {
  constructor(
    @Inject(UsecasesProxyModule.GET_NEW_ENTITIES_PROXY)
    private readonly getUseCaseProxy: UseCaseProxy<GetNewEntitiesUseCases>,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiResponseType(NewEntityPresenter, true)
  async getAll() {
    const entities = await this.getUseCaseProxy.getInstance().execute();
    return NewEntityPresenter.from(entities);
  }
}

// 8. Register in UseCasesProxyModule
// Add provider and export in usecases-proxy.module.ts
```

## Technology Stack

- **Framework**: NestJS 10.x
- **Language**: TypeScript
- **Database**: TypeORM with PostgreSQL/MySQL (configurable)
- **Authentication**: Passport.js with JWT
- **Validation**: class-validator, class-transformer
- **API Format**: JSON:API specification
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Package Manager**: pnpm

## Environment Configuration

- Environment variables managed via `.env` files
- Configuration validated using `class-validator`
- Type-safe config service (`EnvironmentConfigService`)
- Located in `src/infrastructure/config/environment-config/`

## Database Migrations

- TypeORM migrations in `src/infrastructure/database/migrations/`
- Run migrations: `npm run migration:run`
- Generate migration: `npm run migration:generate`

## Best Practices for GitHub Copilot

1. **Always respect the dependency rule** - Domain should never import from infrastructure
2. **Use interfaces for dependencies** - Inject `IRepository`, not `Repository`
3. **Keep use cases focused** - One use case = one user story
4. **Separate concerns** - Domain models ≠ TypeORM entities
5. **Follow the established patterns** - Look at existing code before creating new patterns
6. **Write tests** - Unit tests for use cases, E2E tests for controllers
7. **Use TypeScript strictly** - Avoid `any`, use proper types
8. **Document complex logic** - Add JSDoc comments for non-obvious code
9. **Maintain module boundaries** - Each feature is self-contained

## Common Tasks

### Adding a new endpoint
1. Create use case in `src/usecases/{feature}/`
2. Register use case in `usecases-proxy.module.ts`
3. Create controller method in `src/infrastructure/controllers/{feature}/`
4. Add presenter for response formatting
5. Add Swagger decorators

### Adding authentication to an endpoint
```typescript
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Get('protected')
async protectedRoute() {
  // implementation
}
```

### Adding a new repository method
1. Add method to interface in `src/domain/repositories/`
2. Implement in `src/infrastructure/repositories/`
3. Use in use cases

---

**Remember**: This is Clean Architecture. Keep the domain pure, use cases focused, and infrastructure pluggable. When in doubt, follow the existing patterns in the codebase.

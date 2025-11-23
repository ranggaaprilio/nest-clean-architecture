# JSON:API Implementation

This directory contains the JSON:API v1.1 formatting implementation for the NestJS clean architecture project.

## Overview

All successful API responses are automatically formatted according to the [JSON:API v1.1 specification](https://jsonapi.org/format/1.1/).

## Components

### 1. `jsonapi.interfaces.ts`
Defines TypeScript interfaces for JSON:API structures:
- `ResourceIdentifier` - Basic resource identification
- `ResourceObject` - Complete resource with attributes and relationships
- `JSONAPIError` - Error object structure
- `JSONAPIResponse` - Top-level response structure

### 2. `jsonapi.formatter.ts`
Main formatter class that provides methods to:
- Format single resources
- Format collections
- Format error responses
- Create error objects

### 3. `jsonapi.module.ts`
NestJS module that exports the `JSONAPIFormatter` for dependency injection.

## How It Works

### Success Responses

The `ResponseInterceptor` automatically transforms all successful responses into JSON:API format. It:

1. Detects the resource type from the controller name or request path
2. Checks if the response has a `toJSONAPI()` method (from presenters)
3. Formats the response with metadata (duration, timestamp, etc.)
4. Adds links (self link to the current resource)

### Error Responses

The `AllExceptionFilter` formats all errors into JSON:API error format with:
- Status code
- Error title (based on HTTP status)
- Error detail (exception message)
- Source pointer (request URL)
- Metadata (timestamp, path)

## Example Responses

### Success Response (Single Resource)

```json
{
  "data": {
    "type": "todos",
    "id": "1",
    "attributes": {
      "content": "Buy groceries",
      "isDone": false,
      "createdate": "2025-01-01T00:00:00.000Z",
      "updateddate": "2025-01-01T00:00:00.000Z"
    }
  },
  "meta": {
    "duration": "15ms",
    "method": "GET",
    "timestamp": "2025-11-23T10:00:00.000Z"
  },
  "links": {
    "self": "http://localhost:3000/api/todos/1"
  },
  "jsonapi": {
    "version": "1.1"
  }
}
```

### Success Response (Collection)

```json
{
  "data": [
    {
      "type": "todos",
      "id": "1",
      "attributes": {
        "content": "Buy groceries",
        "isDone": false,
        "createdate": "2025-01-01T00:00:00.000Z",
        "updateddate": "2025-01-01T00:00:00.000Z"
      }
    },
    {
      "type": "todos",
      "id": "2",
      "attributes": {
        "content": "Walk the dog",
        "isDone": true,
        "createdate": "2025-01-02T00:00:00.000Z",
        "updateddate": "2025-01-02T00:00:00.000Z"
      }
    }
  ],
  "meta": {
    "duration": "23ms",
    "method": "GET",
    "timestamp": "2025-11-23T10:00:00.000Z"
  },
  "links": {
    "self": "http://localhost:3000/api/todos"
  },
  "jsonapi": {
    "version": "1.1"
  }
}
```

### Error Response

```json
{
  "errors": [
    {
      "status": "404",
      "title": "Not Found",
      "detail": "Todo with ID 999 not found",
      "source": {
        "pointer": "/api/todos/999"
      },
      "meta": {
        "timestamp": "2025-11-23T10:00:00.000Z",
        "path": "/api/todos/999"
      }
    }
  ],
  "meta": {
    "timestamp": "2025-11-23T10:00:00.000Z"
  },
  "links": {
    "self": "http://localhost:3000/api/todos/999"
  },
  "jsonapi": {
    "version": "1.1"
  }
}
```

## Adding JSON:API Support to New Presenters

To add JSON:API support to a presenter class, implement a `toJSONAPI()` method:

```typescript
export class MyPresenter {
  @ApiProperty()
  id: number
  
  @ApiProperty()
  name: string

  constructor(model: MyModel) {
    this.id = model.id
    this.name = model.name
  }

  toJSONAPI() {
    return {
      type: 'my-resources', // Resource type (pluralized)
      id: this.id.toString(), // Must be string
      attributes: {
        name: this.name,
        // ... other attributes
      },
      // Optional: add relationships
      relationships: {
        // related resources
      }
    }
  }
}
```

## Features

- ✅ Automatic response formatting for all endpoints
- ✅ Support for single resources and collections
- ✅ Error formatting according to JSON:API spec
- ✅ Metadata including request duration and timestamp
- ✅ Self links for all responses
- ✅ Swagger/OpenAPI documentation integration
- ✅ Version 1.1 compliance
- ✅ Support for relationships (can be extended)
- ✅ Support for included resources (sideloading)

## Future Enhancements

- Add pagination links (first, last, prev, next)
- Add filtering and sorting metadata
- Add support for sparse fieldsets
- Add support for compound documents (included resources)
- Add relationship links (self, related)

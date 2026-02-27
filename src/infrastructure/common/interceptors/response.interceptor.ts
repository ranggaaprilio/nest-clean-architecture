import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { JSONAPIFormatter } from '../jsonapi/jsonapi.formatter'
import { JSONAPIResponse } from '../jsonapi/jsonapi.interfaces'

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly formatter: JSONAPIFormatter) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<JSONAPIResponse> {
    const now = Date.now()
    const httpContext = context.switchToHttp()
    const request = httpContext.getRequest()
    const response = httpContext.getResponse()

    return next.handle().pipe(
      map(data => {
        const duration = `${Date.now() - now}ms`
        const resourceType = this.getResourceType(context, request)

        // Add metadata about the request
        const meta = {
          duration,
          method: request.method,
          timestamp: new Date().toISOString(),
        }

        // Add links
        const links = {
          self: `${request.protocol}://${request.get('host')}${request.originalUrl}`,
        }

        // Handle different response types
        if (data === null || data === undefined) {
          return this.formatter.formatDataResponse(null, undefined, meta, links)
        }

        // If data has a toJSONAPI method (from presenters), use it
        if (data && typeof data.toJSONAPI === 'function') {
          const { type, id, attributes, relationships } = data.toJSONAPI()
          const resource = this.formatter.formatResource(
            type,
            id,
            attributes,
            relationships
          )
          return this.formatter.formatDataResponse(
            resource,
            undefined,
            meta,
            links
          )
        }

        // Handle array of items with toJSONAPI method
        if (
          Array.isArray(data) &&
          data.length > 0 &&
          typeof data[0].toJSONAPI === 'function'
        ) {
          const resources = data.map(item => {
            const { type, id, attributes, relationships } = item.toJSONAPI()
            return this.formatter.formatResource(
              type,
              id,
              attributes,
              relationships
            )
          })
          return this.formatter.formatDataResponse(
            resources,
            undefined,
            meta,
            links
          )
        }

        // Handle plain objects or arrays
        if (Array.isArray(data)) {
          // Check if items have id property
          if (data.length > 0 && data[0].id !== undefined) {
            return this.formatter.formatListResponse(
              resourceType,
              data,
              meta,
              links
            )
          }
          // For arrays without id, wrap in a generic resource
          const resource = this.formatter.formatResource(resourceType, '1', {
            items: data,
          })
          return this.formatter.formatDataResponse(
            resource,
            undefined,
            meta,
            links
          )
        }

        // Handle plain objects with id
        if (typeof data === 'object' && data.id !== undefined) {
          const { id, ...attributes } = data
          const resource = this.formatter.formatResource(
            resourceType,
            id,
            attributes
          )
          return this.formatter.formatDataResponse(
            resource,
            undefined,
            meta,
            links
          )
        }

        // Handle plain strings or primitives (e.g., "success" messages)
        if (
          typeof data === 'string' ||
          typeof data === 'number' ||
          typeof data === 'boolean'
        ) {
          const resource = this.formatter.formatResource(resourceType, '1', {
            message: data,
          })
          return this.formatter.formatDataResponse(
            resource,
            undefined,
            meta,
            links
          )
        }

        // Handle other plain objects
        const resource = this.formatter.formatResource(resourceType, '1', data)
        return this.formatter.formatDataResponse(
          resource,
          undefined,
          meta,
          links
        )
      })
    )
  }

  /**
   * Extract resource type from controller and handler context
   */
  private getResourceType(context: ExecutionContext, request: any): string {
    // Try to get from controller class name
    const controllerClass = context.getClass()
    if (controllerClass && controllerClass.name) {
      const name = controllerClass.name.replace('Controller', '').toLowerCase()
      if (name) {
        // Pluralize common resource names
        return this.pluralize(name)
      }
    }

    // Fallback: extract from path
    const path = request.path || request.url || ''
    const segments = path.split('/').filter((s: string) => s.length > 0)
    if (segments.length > 0) {
      return segments[0]
    }

    return 'resources'
  }

  /**
   * Simple pluralization helper
   */
  private pluralize(word: string): string {
    if (word.endsWith('s')) {
      return word
    }
    if (word.endsWith('y')) {
      return word.slice(0, -1) + 'ies'
    }
    return word + 's'
  }
}

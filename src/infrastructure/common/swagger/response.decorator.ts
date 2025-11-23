import { applyDecorators, Type } from '@nestjs/common'
import { ApiOkResponse, ApiExtraModels } from '@nestjs/swagger'

export const ApiResponseType = <TModel extends Type<any>>(
  model: TModel,
  isArray: boolean,
) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      description: 'Successful response in JSON:API format',
      schema: {
        type: 'object',
        properties: {
          data: isArray
            ? {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: {
                      type: 'string',
                      example: 'resources',
                    },
                    id: {
                      type: 'string',
                    },
                    attributes: {
                      type: 'object',
                      description: 'Resource attributes',
                    },
                    relationships: {
                      type: 'object',
                      description: 'Related resources',
                    },
                    links: {
                      type: 'object',
                      properties: {
                        self: {
                          type: 'string',
                        },
                      },
                    },
                  },
                  required: ['type', 'id', 'attributes'],
                },
              }
            : {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    example: 'resources',
                  },
                  id: {
                    type: 'string',
                  },
                  attributes: {
                    type: 'object',
                    description: 'Resource attributes',
                  },
                  relationships: {
                    type: 'object',
                    description: 'Related resources',
                  },
                  links: {
                    type: 'object',
                    properties: {
                      self: {
                        type: 'string',
                      },
                    },
                  },
                },
                required: ['type', 'id', 'attributes'],
              },
          meta: {
            type: 'object',
            properties: {
              duration: {
                type: 'string',
                example: '15ms',
              },
              method: {
                type: 'string',
                example: 'GET',
              },
              timestamp: {
                type: 'string',
                format: 'date-time',
              },
            },
          },
          links: {
            type: 'object',
            properties: {
              self: {
                type: 'string',
                format: 'uri',
              },
            },
          },
          jsonapi: {
            type: 'object',
            properties: {
              version: {
                type: 'string',
                example: '1.1',
              },
            },
          },
        },
        required: ['data', 'jsonapi'],
      },
    }),
  )
}

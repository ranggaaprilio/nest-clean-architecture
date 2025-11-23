export interface ResourceIdentifier {
  id: string
  type: string
  meta?: {
    [key: string]: any
  }
}

export interface ResourceObject extends ResourceIdentifier {
  attributes: {
    [key: string]: any
  }
  relationships?: {
    [key: string]: {
      data: ResourceIdentifier | ResourceIdentifier[] | null
      links?: {
        self?: string
        related?: string
        [key: string]: any
      }
      meta?: {
        [key: string]: any
      }
    }
  }
  links?: {
    self?: string
    [key: string]: any
  }
}

export interface JSONAPIErrorSource {
  pointer?: string
  parameter?: string
  header?: string
}

export interface JSONAPIError {
  id?: string
  links?: {
    about?: string
    [key: string]: any
  }
  status?: string
  code?: string
  title?: string
  detail?: string
  source?: JSONAPIErrorSource
  meta?: {
    [key: string]: any
  }
}

export interface JSONAPIResponse {
  data?: ResourceObject | ResourceObject[] | null
  errors?: JSONAPIError[]
  meta?: {
    [key: string]: any
  }
  links?: {
    self?: string
    related?: string
    first?: string
    last?: string
    prev?: string
    next?: string
    describedby?: string
    [key: string]: any
  }
  jsonapi?: {
    version?: string
    meta?: {
      [key: string]: any
    }
  }
  included?: ResourceObject[]
}

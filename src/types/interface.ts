export type GenericErrorMessage = {
  message: string
  path: string | number
}

export type GenericErrorResponse = {
  statusCode: number
  message: string
  errorMessages: GenericErrorMessage[]
}

export type IPaginationOptions = {
  page: number
  limit: number
  sortBy: string
  sortOrder: string
}

type IOptions = {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: string
}

type IOptionsResult = {
  page: number
  limit: number
  skip: number
  sortBy: string
  sortOrder: string
}

const calculatePagination = (options: IOptions): IOptionsResult => {
  const rawPage = Number(options.page)
  const rawLimit = Number(options.limit)
  // Enforce positive integers; defaults: page=1, limit=10; and cap limit to protect the DB
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1
  const MAX_LIMIT = 100
  const limit =
    Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(Math.floor(rawLimit), MAX_LIMIT) : 10
  const skip = (page - 1) * limit

  const sortBy = options.sortBy && options.sortBy.trim() ? options.sortBy : 'createdAt'
  const normalizedOrder =
    typeof options.sortOrder === 'string' ? options.sortOrder.toLowerCase() : undefined
  const sortOrder: 'asc' | 'desc' = normalizedOrder === 'asc' ? 'asc' : 'desc'

  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
  }
}

export const paginationHelpers = {
  calculatePagination,
}

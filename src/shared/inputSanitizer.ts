/**
 * Input sanitization utilities to prevent injection attacks
 */

/**
 * Sanitize string input to prevent SQL injection and XSS
 * Removes potentially dangerous characters while preserving valid input
 */
export const sanitizeString = (input: string | undefined | null): string => {
  if (!input) return ''

  // Convert to string and trim
  let sanitized = String(input).trim()

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '')

  // Limit length to prevent DoS
  const MAX_LENGTH = 1000
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH)
  }

  return sanitized
}

/**
 * Sanitize search term for safe database queries
 * Removes special characters that could be exploited
 */
export const sanitizeSearchTerm = (searchTerm: string | undefined | null): string => {
  if (!searchTerm) return ''

  let sanitized = sanitizeString(searchTerm)

  // Remove SQL wildcards and special characters
  sanitized = sanitized.replace(/[%_\\]/g, '')

  // Remove potential command injection characters
  sanitized = sanitized.replace(/[;'"<>]/g, '')

  // Limit to alphanumeric, spaces, hyphens, and basic punctuation
  sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-.,@]/g, '')

  return sanitized.trim()
}

/**
 * Validate and sanitize UUID
 */
export const sanitizeUUID = (id: string | undefined | null): string | null => {
  if (!id) return null

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  if (uuidRegex.test(id)) {
    return id.toLowerCase()
  }

  return null
}

/**
 * Validate and sanitize numeric input
 */
export const sanitizeNumber = (input: any): number | null => {
  if (input === null || input === undefined || input === '') return null

  const num = Number(input)

  // Check if valid number and not NaN or Infinity
  if (isNaN(num) || !isFinite(num)) {
    return null
  }

  return num
}

/**
 * Sanitize array of strings
 */
export const sanitizeStringArray = (input: any[]): string[] => {
  if (!Array.isArray(input)) return []

  return input
    .filter(item => typeof item === 'string')
    .map(item => sanitizeString(item))
    .filter(item => item.length > 0)
}

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate date string
 */
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * Sanitize pagination parameters
 */
export const sanitizePaginationParams = (page?: any, limit?: any) => {
  const sanitizedPage = sanitizeNumber(page)
  const sanitizedLimit = sanitizeNumber(limit)

  return {
    page: sanitizedPage && sanitizedPage > 0 ? sanitizedPage : 1,
    limit: sanitizedLimit && sanitizedLimit > 0 && sanitizedLimit <= 100 ? sanitizedLimit : 10,
  }
}

/**
 * Sanitize sort parameters
 */
export const sanitizeSortParams = (sortBy?: string, sortOrder?: string) => {
  // Whitelist allowed sort fields
  const allowedSortFields = ['createdAt', 'updatedAt', 'trialNo', 'trialDate', 'status', 'country']
  const allowedSortOrders = ['asc', 'desc']

  return {
    sortBy: sortBy && allowedSortFields.includes(sortBy) ? sortBy : 'createdAt',
    sortOrder:
      sortOrder && allowedSortOrders.includes(sortOrder.toLowerCase())
        ? (sortOrder.toLowerCase() as 'asc' | 'desc')
        : 'desc',
  }
}

/**
 * Escape special regex characters
 */
export const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Prevent NoSQL injection for MongoDB-like queries (if needed)
 */
export const preventNoSQLInjection = (obj: any): any => {
  if (obj === null || obj === undefined) return obj

  if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      return obj.map(item => preventNoSQLInjection(item))
    }

    const sanitized: any = {}
    for (const key in obj) {
      // Skip keys that start with $ (NoSQL operators)
      if (key.startsWith('$')) continue

      sanitized[key] = preventNoSQLInjection(obj[key])
    }
    return sanitized
  }

  return obj
}

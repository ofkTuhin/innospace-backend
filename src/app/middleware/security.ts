import { Request, Response, NextFunction } from 'express'
import ApiError from '@/errors/ApiError'
import httpStatus from 'http-status'

/**
 * Middleware to validate and sanitize request parameters
 * Prevents malicious input from reaching the application
 */
export const validateRequestParams = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate UUID format for ID parameters
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    if (req.params.id && !uuidRegex.test(req.params.id)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid ID format')
    }

    // Validate other ID parameters
    const idParams = ['userId', 'trialId', 'recipeId', 'machineId']
    for (const param of idParams) {
      if (req.params[param] && !uuidRegex.test(req.params[param])) {
        throw new ApiError(httpStatus.BAD_REQUEST, `Invalid ${param} format`)
      }
    }

    next()
  } catch (error) {
    next(error)
  }
}

/**
 * Middleware to prevent parameter pollution
 * Removes duplicate query parameters
 */
export const preventParameterPollution = (req: Request, res: Response, next: NextFunction) => {
  try {
    for (const key in req.query) {
      if (Array.isArray(req.query[key])) {
        // If array, take only the first value
        req.query[key] = (req.query[key] as string[])[0]
      }
    }
    next()
  } catch (error) {
    next(error)
  }
}

/**
 * Middleware to validate pagination parameters
 */
export const validatePagination = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.query.page) {
      const page = parseInt(req.query.page as string)
      if (isNaN(page) || page < 1) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid page parameter')
      }
      if (page > 10000) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Page parameter too large')
      }
    }

    if (req.query.limit) {
      const limit = parseInt(req.query.limit as string)
      if (isNaN(limit) || limit < 1) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid limit parameter')
      }
      if (limit > 100) {
        // Cap maximum limit
        req.query.limit = '100'
      }
    }

    next()
  } catch (error) {
    next(error)
  }
}

/**
 * Middleware to sanitize string inputs in request body
 */
export const sanitizeRequestBody = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.body && typeof req.body === 'object') {
      sanitizeObject(req.body)
    }
    next()
  } catch (error) {
    next(error)
  }
}

/**
 * Recursively sanitize object properties
 */
function sanitizeObject(obj: any): void {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      // Remove null bytes
      obj[key] = obj[key].replace(/\0/g, '')

      // Limit string length to prevent DoS
      if (obj[key].length > 10000) {
        obj[key] = obj[key].substring(0, 10000)
      }
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key])
    }
  }
}

/**
 * Middleware to prevent NoSQL injection
 * Blocks MongoDB operators in request body
 */
export const preventNoSQLInjection = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.body) {
      checkForNoSQLOperators(req.body)
    }
    if (req.query) {
      checkForNoSQLOperators(req.query)
    }
    next()
  } catch (error) {
    next(error)
  }
}

/**
 * Check for NoSQL injection operators
 */
function checkForNoSQLOperators(obj: any): void {
  if (typeof obj !== 'object' || obj === null) return

  for (const key in obj) {
    if (key.startsWith('$')) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid request parameters')
    }

    if (typeof obj[key] === 'object' && obj[key] !== null) {
      checkForNoSQLOperators(obj[key])
    }
  }
}

/**
 * Middleware to add security headers
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff')

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block')

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY')

  // Strict transport security (HTTPS)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')

  // Content security policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
  )

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

  next()
}

/**
 * Middleware to validate file uploads
 */
export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file && !req.files) {
      return next()
    }

    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]

    const maxFileSize = 10 * 1024 * 1024 // 10MB

    const file = req.file || (Array.isArray(req.files) ? req.files[0] : null)

    if (file) {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid file type')
      }

      if (file.size > maxFileSize) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'File size exceeds limit (10MB)')
      }
    }

    next()
  } catch (error) {
    next(error)
  }
}

/**
 * Combine all security middlewares
 */
export const applySecurity = [
  securityHeaders,
  preventParameterPollution,
  sanitizeRequestBody,
  preventNoSQLInjection,
  validateRequestParams,
]

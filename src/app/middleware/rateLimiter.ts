import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit'
import { Request, Response } from 'express'

/**
 * Rate Limiter Configuration for different endpoint types
 * Prevents abuse and protects against DoS attacks
 */

/**
 * Strict rate limiting for authentication endpoints
 * Prevents brute force attacks on login
 */
export const authRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req: Request) => {
    // Rate limit by IP and username/email if provided
    const identifier = req.body?.email || req.body?.username || req.ip
    return `auth:${identifier}`
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again after 15 minutes.',
      statusCode: 429,
    })
  },
})

/**
 * Password reset rate limiting
 * Prevents password reset spam
 */
export const passwordResetRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: 'Too many password reset requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const email = req.body?.email || req.ip
    return `password-reset:${email}`
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many password reset requests. Please try again in 1 hour.',
      statusCode: 429,
    })
  },
})

/**
 * Registration rate limiting
 * Prevents spam account creation
 */
export const registrationRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour per IP
  message: 'Too many accounts created. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => `register:${req.ip}`,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Registration limit exceeded. Please try again later.',
      statusCode: 429,
    })
  },
})

/**
 * Trial creation rate limiting
 * Prevents spam trial creation
 */
export const createTrialRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 trials per hour
  message: 'Trial creation limit exceeded. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const userId = req.user?.id || req.ip
    return `create-trial:${userId}`
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'You have created too many trials. Please try again in 1 hour.',
      statusCode: 429,
    })
  },
})

/**
 * File upload rate limiting
 * Prevents storage abuse and DoS via large uploads
 */
export const fileUploadRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 uploads per hour
  message: 'File upload limit exceeded. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const userId = req.user?.id || req.ip
    return `file-upload:${userId}`
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'File upload limit exceeded. Please try again in 1 hour.',
      statusCode: 429,
    })
  },
})

/**
 * Search and filter rate limiting
 * Prevents database overload from expensive queries
 */
export const searchRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: 'Too many search requests. Please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const userId = req.user?.id || req.ip
    return `search:${userId}`
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many search requests. Please wait a moment.',
      statusCode: 429,
    })
  },
})

/**
 * Dashboard and analytics rate limiting
 * Limits expensive aggregation queries
 */
export const dashboardRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many dashboard requests. Please wait a moment.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const userId = req.user?.id || req.ip
    return `dashboard:${userId}`
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Dashboard request limit exceeded. Please wait a moment.',
      statusCode: 429,
    })
  },
})

/**
 * PDF generation rate limiting
 * Expensive CPU operation - strict limits
 */
export const pdfGenerationRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 PDFs per hour
  message: 'PDF generation limit exceeded. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const userId = req.user?.id || req.ip
    return `pdf-gen:${userId}`
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'PDF generation limit exceeded. Please try again in 1 hour.',
      statusCode: 429,
    })
  },
})

/**
 * Recipe/process creation rate limiting
 */
export const createRecipeRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // 30 recipes per hour
  message: 'Recipe creation limit exceeded.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const userId = req.user?.id || req.ip
    return `create-recipe:${userId}`
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Recipe creation limit exceeded. Please try again later.',
      statusCode: 429,
    })
  },
})

/**
 * Update operations rate limiting
 * Prevents rapid-fire updates
 */
export const updateRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // 5 updates per minute
  message: 'Too many update requests.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const userId = req.user?.id || req.ip
    return `update:${userId}`
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many update requests. Please slow down.',
      statusCode: 429,
    })
  },
})

/**
 * Delete operations rate limiting
 * Prevents accidental mass deletion
 */
export const deleteRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // 10 deletes per 5 minutes
  message: 'Too many delete requests.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const userId = req.user?.id || req.ip
    return `delete:${userId}`
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many delete requests. Please wait a moment.',
      statusCode: 429,
    })
  },
})

/**
 * Global API rate limiter
 * Baseline protection for all API endpoints
 */
export const globalApiRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests from this IP. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const userId = req.user?.id || req.ip
    return `global:${userId}`
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again in 15 minutes.',
      statusCode: 429,
    })
  },
})

/**
 * Strict rate limiter for sensitive operations
 * Used for critical endpoints like account deletion, password change
 */
export const strictRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts per hour
  message: 'Too many attempts for this sensitive operation.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const userId = req.user?.id || req.ip
    return `strict:${userId}`
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many attempts. Please try again in 1 hour.',
      statusCode: 429,
    })
  },
})

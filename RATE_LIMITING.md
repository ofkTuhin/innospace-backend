# Rate Limiting Implementation Guide

## Overview

This application now has comprehensive rate limiting implemented to protect against:

- **Brute force attacks** on authentication endpoints
- **DoS/DDoS attacks** via excessive requests
- **Resource exhaustion** from expensive operations (PDF generation, dashboard queries)
- **Spam** (trial creation, user registration)
- **Database overload** from search queries

## Rate Limiters Configured

### 1. **Authentication Rate Limiter** (`authRateLimiter`)

- **Window**: 15 minutes
- **Max Requests**: 5 attempts
- **Applied To**:
  - `/api/v1/auth/login`
  - `/api/v1/auth/check-user`
- **Use Case**: Prevents brute force login attacks

### 2. **Password Reset Rate Limiter** (`passwordResetRateLimiter`)

- **Window**: 1 hour
- **Max Requests**: 3 attempts
- **Applied To**:
  - `/api/v1/auth/forgot-password`
  - `/api/v1/auth/validate-otp`
  - `/api/v1/auth/reset-password`
  - `/api/v1/auth/resend-otp`
- **Use Case**: Prevents password reset spam

### 3. **Registration Rate Limiter** (`registrationRateLimiter`)

- **Window**: 1 hour
- **Max Requests**: 3 registrations
- **Applied To**:
  - `POST /api/v1/users`
- **Use Case**: Prevents spam account creation

### 4. **Trial Creation Rate Limiter** (`createTrialRateLimiter`)

- **Window**: 1 hour
- **Max Requests**: 20 trials
- **Applied To**:
  - `POST /api/v1/trial`
- **Use Case**: Prevents trial spam

### 5. **File Upload Rate Limiter** (`fileUploadRateLimiter`)

- **Window**: 1 hour
- **Max Requests**: 50 uploads
- **Applied To**:
  - User avatar uploads
  - Quality report file uploads
- **Use Case**: Prevents storage abuse

### 6. **Search Rate Limiter** (`searchRateLimiter`)

- **Window**: 1 minute
- **Max Requests**: 30 requests
- **Applied To**:
  - `GET /api/v1/trial` (list with filters)
  - `GET /api/v1/recipe`
  - `GET /api/v1/users`
- **Use Case**: Prevents database overload from search queries

### 7. **Dashboard Rate Limiter** (`dashboardRateLimiter`)

- **Window**: 1 minute
- **Max Requests**: 10 requests
- **Applied To**:
  - `GET /api/v1/trial/dashboard`
  - `GET /api/v1/trial/last-30-days`
- **Use Case**: Limits expensive aggregation queries

### 8. **PDF Generation Rate Limiter** (`pdfGenerationRateLimiter`)

- **Window**: 1 hour
- **Max Requests**: 10 PDFs
- **Applied To**:
  - `GET /api/v1/trial/:id/pdf`
- **Use Case**: Prevents CPU exhaustion from PDF generation

### 9. **Recipe Creation Rate Limiter** (`createRecipeRateLimiter`)

- **Window**: 1 hour
- **Max Requests**: 30 recipes
- **Applied To**:
  - `POST /api/v1/recipe`
- **Use Case**: Prevents recipe spam

### 10. **Update Rate Limiter** (`updateRateLimiter`)

- **Window**: 1 minute
- **Max Requests**: 20 updates
- **Applied To**:
  - `PATCH /api/v1/trial/:id`
  - `PATCH /api/v1/recipe/:id`
  - `PATCH /api/v1/users/:id`
- **Use Case**: Prevents rapid-fire updates

### 11. **Delete Rate Limiter** (`deleteRateLimiter`)

- **Window**: 5 minutes
- **Max Requests**: 10 deletes
- **Applied To**:
  - `DELETE /api/v1/trial/:id`
  - `DELETE /api/v1/recipe/:id`
  - `DELETE /api/v1/users/:id`
- **Use Case**: Prevents accidental mass deletion

### 12. **Strict Rate Limiter** (`strictRateLimiter`)

- **Window**: 1 hour
- **Max Requests**: 5 attempts
- **Applied To**:
  - `/api/v1/auth/set-password`
  - `/api/v1/users/change-password`
- **Use Case**: Protects sensitive operations

### 13. **Global API Rate Limiter** (`globalApiRateLimiter`)

- **Window**: 15 minutes
- **Max Requests**: 100 requests
- **Applied To**: All `/api/v1/*` routes
- **Use Case**: Baseline protection for entire API

## Rate Limiting Strategy

### User-Based vs IP-Based

- **Authenticated endpoints**: Rate limited by `userId`
- **Unauthenticated endpoints**: Rate limited by `IP address`
- **Hybrid**: Some endpoints use both (e.g., login uses email + IP)

### Response Format

When rate limit is exceeded, users receive:

```json
{
  "success": false,
  "message": "Too many requests. Please try again in X minutes.",
  "statusCode": 429
}
```

### Headers Included

- `RateLimit-Limit`: Maximum requests allowed
- `RateLimit-Remaining`: Requests remaining in window
- `RateLimit-Reset`: Timestamp when limit resets
- `Retry-After`: Seconds until retry is allowed

## Configuration

All rate limiters are centrally configured in:

```
src/app/middleware/rateLimiter.ts
```

To modify a rate limiter:

```typescript
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Change window
  max: 5, // Change max requests
  // ... other options
})
```

## Testing Rate Limits

### Using curl:

```bash
# Test login rate limit (5 attempts)
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' \
    -i
done
```

### Expected Behavior:

- First 5 requests: Normal responses (401 Unauthorized)
- 6th request: **429 Too Many Requests**

## Monitoring

Monitor rate limit violations by checking:

1. **Application logs** - Rate limit hits are logged
2. **Response headers** - Check `RateLimit-*` headers
3. **Status code 429** - Indicates rate limit exceeded

## Production Considerations

### Redis Integration (Recommended)

For production with multiple server instances, use Redis:

```typescript
import RedisStore from 'rate-limit-redis'
import { createClient } from 'redis'

const redisClient = createClient({
  url: process.env.REDIS_URL,
})

export const authRateLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:auth:',
  }),
  // ... other options
})
```

### Environment Variables

Consider making limits configurable:

```typescript
windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW || '900000'),
max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '5'),
```

## Security Best Practices

1. ✅ **Trust Proxy**: `app.set('trust proxy', 1)` is enabled
2. ✅ **User-based limiting**: Authenticated users tracked by ID
3. ✅ **Standard headers**: Rate limit info in response headers
4. ✅ **Granular limits**: Different limits for different operations
5. ✅ **Global baseline**: 100 req/15min for all API endpoints

## Bypass for Testing

To temporarily disable rate limiting (development only):

```typescript
// In rateLimiter.ts
export const authRateLimiter = (req, res, next) => next() // Bypass
```

**⚠️ Never disable in production!**

## Troubleshooting

### Issue: Legitimate users getting blocked

**Solution**: Increase `max` value or use whitelist

### Issue: Rate limits not working

**Solution**:

- Check `app.set('trust proxy', 1)` is enabled
- Verify middleware order (rate limiters before routes)
- Check for Redis connection if using Redis store

### Issue: Different servers have different counts

**Solution**: Implement Redis-based store for shared state

## Summary

Your application is now protected with 13 different rate limiters covering:

- ✅ Authentication endpoints (brute force protection)
- ✅ Resource-intensive operations (PDF, dashboard)
- ✅ Data modification operations (create, update, delete)
- ✅ Search and query endpoints
- ✅ File upload operations
- ✅ Global API protection

This multi-layered approach provides comprehensive protection against various attack vectors and abuse patterns.

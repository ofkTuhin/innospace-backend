import express from 'express'

import checkAuth from '@/app/middleware/checkAuth'
import zodValidationHandler from '@/app/middleware/zodValidationHandler'

import { authController } from './auth.controller'
import { loginValidation } from './auth.validation'
import {
  authRateLimiter,
  passwordResetRateLimiter,
  strictRateLimiter,
} from '@/app/middleware/rateLimiter'

const router = express.Router()

router.post('/check-user', authRateLimiter, authController.getUserEmailAndPassword)

router.post('/set-password', strictRateLimiter, authController.setPassword)

router.post(
  '/login',
  authRateLimiter,
  zodValidationHandler(loginValidation.loginUser),
  authController.loginUser
)

router.get(
  '/access-token',
  // zodValidationHandler(loginValidation.getAccessToken),
  authController.getAccessToken
)

router.get('/user', checkAuth(), authController.getLoggedInUser)

router.post('/forgot-password', passwordResetRateLimiter, authController.forgotPassword)

router.post('/validate-otp', passwordResetRateLimiter, authController.validateOTPAndGenerateToken)

router.patch('/reset-password', passwordResetRateLimiter, authController.resetPassword)

router.post('/resend-otp', passwordResetRateLimiter, authController.resendOtp)

router.post('/logout', authController.logout)

export const authRouter = router

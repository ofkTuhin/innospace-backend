import { Request, Response } from 'express'
import httpStatus from 'http-status'

import ApiError from '@/errors/ApiError'
import catchAsync from '@/shared/catchAsync'
import sendResponse from '@/shared/sendResponse'
import { ILoginResponse } from './auth.interface'
import { authService } from './auth.service'
import config from '@/config'

// update semester

const getUserEmailAndPassword = catchAsync(async (req: Request, res: Response) => {
  const { email, isForget } = req.body

  const result = await authService.checkUserEmailAndPassword(email, isForget)

  sendResponse(res, {
    success: true,
    message: 'User email and password checked successfully',
    statusCode: httpStatus.OK,
    data: result,
  })
})
// Meeting ID: 215 796 174 324 02
// Passcode: oG9P5KQ7
const loginUser = catchAsync(async (req: Request, res: Response) => {
  const loginUserData = req.body

  const result = await authService.loginUser(loginUserData)
  const { accessToken, ...others } = result

  const isProd = config.env === 'production'
  const accessTokenCookieOptions = {
    // secure: true,
    // httpOnly: true,
    // maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
    // expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    // sameSite: 'none' as const,
    httpOnly: true,
    secure: true,
    sameSite: config.env === 'production' ? ('none' as const) : ('lax' as const),
    domain: config.env === 'production' ? '.fibre52.com' : undefined, // ⭐ required
    path: '/',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    // maxAge: 30 * 24 * 60 * 60 * 1000,
  }

  res.cookie('accessToken', accessToken, accessTokenCookieOptions)

  sendResponse<Partial<ILoginResponse>>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Login successfully!',
    data: result,
  })
})

const getAccessToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies

  const result = await authService.getAccessToken(refreshToken)

  const cookieOptions = {
    secure: true,
    httpOnly: true,
    sameSite: 'none' as const,
  }

  res.cookie('accessToken', result.accessToken, cookieOptions)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User logged in successfully !',
  })
})

const getLoggedInUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user || {}

  const user = await authService.getLoggedInUser(userId)

  sendResponse(res, {
    success: true,
    message: 'user retrieved successfully',
    statusCode: httpStatus.OK,
    data: user,
  })
})

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body

  const result = await authService.forgotPassword(email)

  sendResponse(res, {
    success: true,
    message: 'OTP sent successfully',
    statusCode: httpStatus.OK,
    data: result,
  })
})

const validateOTPAndGenerateToken = catchAsync(async (req: Request, res: Response) => {
  const { email, otp, purpose } = req.body
  const result = await authService.validateOTPAndGenerateToken(email, otp, purpose)

  sendResponse(res, {
    success: true,
    message: 'OTP validated successfully',
    statusCode: httpStatus.OK,
    data: result,
  })
})

const setPassword = catchAsync(async (req: Request, res: Response) => {
  const { password } = req.body
  const token = (req.headers['set-token'] as string).split(' ')[1]

  const result = await authService.setPassword(password, token)

  const { accessToken, ...others } = result

  const accessTokenCookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: config.env === 'production' ? ('none' as const) : ('lax' as const),
    domain: config.env === 'production' ? 'fibre52.com' : undefined, // ⭐ required
    path: '/',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  }

  res.cookie('accessToken', accessToken, accessTokenCookieOptions)

  sendResponse(res, {
    success: true,
    message: 'Password set successfully',
    statusCode: httpStatus.OK,
    data: result,
  })
})

const resendOtp = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body

  const result = await authService.resendOtp(email)

  sendResponse(res, {
    success: true,
    message: 'OTP resent successfully',
    statusCode: httpStatus.OK,
    data: result,
  })
})

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const authHeader = req.headers['reset-token'] as string
  const token = authHeader.split(' ')[1]
  if (!authHeader || !token) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or missing authorization header')
  }

  const { password, confirmPassword } = req.body

  const result = await authService.resetPassword(password, confirmPassword, token)

  sendResponse(res, {
    success: true,
    message: 'Password reset successfully',
    statusCode: httpStatus.OK,
    data: result,
  })
})

const logout = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user || {}

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: config.env === 'production' ? ('none' as const) : ('lax' as const),
    domain: config.env === 'production' ? 'fibre52.com' : undefined,
    path: '/',
  }

  res.clearCookie('accessToken', cookieOptions)

  // const result = await authService.logout(userId)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User logged out successfully',
  })
})

export const authController = {
  getUserEmailAndPassword,
  loginUser,
  getAccessToken,
  getLoggedInUser,
  forgotPassword,
  validateOTPAndGenerateToken,
  resetPassword,
  setPassword,
  resendOtp,
  logout,
}

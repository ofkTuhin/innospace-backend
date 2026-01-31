import config from '@/config'
import ApiError from '@/errors/ApiError'
import { jwtHelpers } from '@/helper/jwtHelpers'
import { comparePassword, hashPassword } from '@/shared/bcrypt'
import prisma from '@/shared/prisma'
import httpStatus from 'http-status'
import * as jwt from 'jsonwebtoken'
import { Secret } from 'jsonwebtoken'

// TODO: Create email.ts file with sendOTPEmail function or remove this import
// import { sendOTPEmail } from '@/shared/email'
import { generateOTP } from '@/shared/generateOtp'
import { userRepository } from '../users/user.repository'
import { ILoginDto } from './auth.dto'
import { ILoginResponse, IRefreshTokenAccess } from './auth.interface'
import { authRepository } from './auth.repository'
import { AUTH_CONSTANTS } from './auth.const'

const checkUserEmailAndPassword = async (email: string, isForget?: boolean) => {
  const user = await userRepository.findByEmail(email)
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found')
  }

  if (!user.password || isForget) {
    await authRepository.deleteOtp(email)
    await sendOTP(email)
  }

  return {
    isPassword: !!user.password,
  }
}

const loginUser = async (payload: ILoginDto) => {
  const { email, password } = payload

  const user = await userRepository.findByEmailOrMobileNumber(email, '', {
    password: true,
    status: true,
  })

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found')
  }

  if (user.status === false) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Your account has been disabled')
  }

  if (user.password && !(await comparePassword(password, user.password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password in incorrect')
  }

  const jwtPayload = {
    userId: user.id,
    role: user.role,
  }

  const accessToken = jwtHelpers.createToken(
    jwtPayload,
    config.jwt.secret as Secret,
    String(config.jwt.expires_in) as string
  )

  return {
    message: 'Login successful',
    accessToken,
    email: user.email,
    firstName: user.firstName!,
    lastName: user.lastName!,
    id: user.id,
    role: user.role,
  }
}

const getAccessToken = async (token: string): Promise<IRefreshTokenAccess> => {
  let verifiedToken
  try {
    verifiedToken = jwtHelpers.verifyToken(token, config.jwt.refresh_secret as Secret)
  } catch (err) {
    console.error(err)
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid Refresh Token')
  }

  const { userId } = verifiedToken
  const isUserExist = await userRepository.findById({
    where: {
      id: userId,
    },
  })

  if (!isUserExist) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User not found')
  }

  const jwtPayload = {
    userId: isUserExist.id,
    role: isUserExist.role,
  }
  const newAccessToken = jwtHelpers.createToken(
    jwtPayload,
    config.jwt.secret as Secret,
    String(config.jwt.expires_in) as string
  )
  return {
    accessToken: newAccessToken,
  }
}

const getLoggedInUser = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      firstName: true,
      lastName: true,
      phoneNumber: true,
      avatar: true,
      email: true,
      role: true,
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  return user
}
export const forgotPassword = async (email: string) => {
  const user = await userRepository.findByEmail(email)

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found')
  }

  await sendOTP(email)

  return user
}

/**
 * Validates OTP and returns a temporary token for password reset
 * @param email - User's email address
 * @param otp - OTP to validate
 * @returns Temporary JWT token for password reset
 */

export const validateOTPAndGenerateToken = async (
  email: string,
  otp: string,
  purpose: string
): Promise<string> => {
  const user = await userRepository.findByEmail(email)

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found')
  }

  const otpData = await authRepository.findOtp(email)

  if (!otpData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OTP not found')
  }

  // check if otp code is expired
  if (otpData.expiresAt < new Date(Date.now() * 1000 * 60)) {
    throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, 'OTP is expired or already been used.')
  }
  //   check if otp code is correct
  if (otpData.otp !== otp) {
    throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, 'Invalid OTP')
  }

  await authRepository.deleteOtp(email)

  if (!process.env.JWT_SECRET) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'JWT secret not configured')
  }
  const token = jwtHelpers.createToken(
    {
      userId: user.id,
      role: user.role,
      email: user.email,
      purpose: purpose,
    },
    config.jwt.secret as Secret,
    '15m'
  )
  return token
}

const resendOtp = async (email: string): Promise<{ message: string }> => {
  const user = await authRepository.findByEmail(email)
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found')
  }
  await authRepository.deleteOtp(email)

  await sendOTP(email)
  return {
    message: 'OTP sent successfully',
  }
}

export const setPassword = async (password: string, token: string): Promise<ILoginResponse> => {
  const decoded = jwtHelpers.verifyToken(token, config.jwt.secret as Secret) as {
    email: string
    purpose: string
  }

  const { email, purpose } = decoded
  // Verify this token is specifically for password reset
  if (purpose !== AUTH_CONSTANTS.SET_PASSWORD_PURPOSE) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token purpose')
  }

  const user = await userRepository.findByEmail(email)

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found')
  }

  const hashedPassword = await hashPassword(password)

  const updatedUser = await userRepository.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  })
  let login: ILoginResponse | undefined
  if (updatedUser) {
    login = await loginUser({ email: updatedUser.email, password })
  }

  return login!
}

/**
 * Resets user password using temporary token
 * @param password - New password
 * @param confirmPassword - Confirm password
 * @param token - Temporary JWT token from OTP validation
 * @returns User data without password
 */
export const resetPassword = async (
  password: string,
  confirmPassword: string,
  token: string
): Promise<any> => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'JWT secret not configured')
    }

    const decoded = jwtHelpers.verifyToken(token, config.jwt.secret as Secret) as {
      email: string
      purpose: string
    }
    const { email, purpose } = decoded
    if (purpose !== AUTH_CONSTANTS.RESET_PASSWORD_PURPOSE) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token purpose')
    }

    const user = await userRepository.findByEmail(email)

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found')
    }

    const hashedPassword = await hashPassword(password)

    const updatedUser = await userRepository.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    return updatedUser
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token')
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Token expired')
    }
    throw error
  }
}

export const sendOTP = async (
  email?: string | null,
  phoneNumber?: string | null
): Promise<void> => {
  const otp = generateOTP()
  const createOtp = await authRepository.createOtp(email!, otp)

  if (createOtp) {
    // TODO: Implement sendOTPEmail function
    // await sendOTPEmail(createOtp.email!, createOtp.otp)
    console.log('OTP created:', createOtp.otp, 'for email:', createOtp.email)
  } else if (phoneNumber) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Phone number is not supported yet')
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Either email or mobile number is required')
  }
}
const logout = async (userId: string): Promise<{ message: string }> => {
  // No server-side token invalidation for stateless JWT, just clear cookies on client
  const user = await userRepository.findById({ where: { id: userId } })

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found')
  }
  return { message: 'Logout successful' }
}

export const authService = {
  loginUser,
  getAccessToken,
  getLoggedInUser,
  validateOTPAndGenerateToken,
  resetPassword,
  forgotPassword,
  checkUserEmailAndPassword,
  setPassword,
  resendOtp,
  logout,
}

import { NextFunction, Request, Response } from 'express'
import httpStatus from 'http-status'
import { Secret } from 'jsonwebtoken'

import config from '@/config'
import ApiError from '@/errors/ApiError'
import { jwtHelpers } from '@/helper/jwtHelpers'
import prisma from '@/shared/prisma'

const checkAuth =
  (...roles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let token = ''
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer ') &&
        req.headers.authorization?.split(' ')[1] !== 'undefined'
      ) {
        token = req.headers.authorization.split(' ')[1]
      } else if (req.cookies?.accessToken && req.cookies?.accessToken !== 'undefined') {
        token = req.cookies?.accessToken
      }

      if (!token || token === 'undefined') {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'No token provided')
      }

      // ✅ verify handles expiration internally
      const verifiedUser = jwtHelpers.verifyToken(token, config.jwt.secret as Secret)

      if (!verifiedUser || !verifiedUser.userId) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token')
      }

      req.user = verifiedUser

      // const rolePermission = await prisma.rolePermission.findFirst({
      //   where: {
      //     roleId: verifiedUser.roleId,
      //     permission: {
      //       module: { name: moduleName },
      //       action: action,
      //     },
      //   },
      //   include: { permission: { include: { module: true } } },
      // })

      const isUser = await prisma.user.findUnique({
        where: { id: verifiedUser.userId },
      })

      if (!isUser) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'User not found')
      }

      // Check if user role matches any of the allowed roles
      if (roles.length > 0 && !roles.includes(isUser.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden: No access')
      }

      // Attach user role to request
      req.user.role = isUser.role

      next()
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return next(new ApiError(httpStatus.UNAUTHORIZED, 'Token expired, please login again'))
      }
      if (error.name === 'JsonWebTokenError') {
        return next(new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token'))
      }
      console.error('🚀 Auth error:', error)
      next(error)
    }
  }

export default checkAuth

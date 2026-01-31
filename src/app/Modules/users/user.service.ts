import { paginationHelpers } from '@/helper/paginationHelper'
import { comparePassword, hashPassword } from '@/shared/bcrypt'
import { IPaginationOptions } from '@/types/pagination'
import { TUserFilterOptions } from './user.interface'
import { userRepository } from './user.repository'
import { CreateUserDto, UpdateUserDto } from './user.dto'
import { Prisma, UserRole } from 'generated/prisma'
import ApiError from '@/errors/ApiError'
import httpStatus from 'http-status'
import prisma from '@/shared/prisma'

const createUser = async (userData: CreateUserDto) => {
  // const { password, ...userCreateData } = userData

  // Check if user already exists
  const isUserExists = await userRepository.findByEmailOrMobileNumber(
    userData.email,
    userData.phoneNumber ?? ''
  )
  if (isUserExists) {
    throw new Error('User already exists with this email or phone')
  }

  if (userData.password) {
    const hashedPassword = await hashPassword(userData.password)
    userData.password = hashedPassword
  }
  // Format userMeta into [{ key, value }]

  // Validate role
  if (!['ADMIN', 'OFFICER'].includes(userData.role)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Role must be either ADMIN or OFFICER')
  }

  // ✅ Create user and link branches in one query
  const user = await userRepository.create({
    data: {
      ...userData,
      role: userData.role as UserRole,
    },
  })

  if (!user) {
    throw new Error('Failed to create user')
  }

  return user
}

const buildUserWhereClause = (filterOptions: TUserFilterOptions) => {
  const where: any = {}
  const { searchTerm, role } = filterOptions

  if (searchTerm) {
    where.OR = [
      { email: { contains: searchTerm, mode: 'insensitive' } },
      { firstName: { contains: searchTerm, mode: 'insensitive' } },
      { lastName: { contains: searchTerm, mode: 'insensitive' } },
    ]
  }

  if (role) {
    where.role = role
  }
  return where
}

const getAllUsers = async ({
  paginationOptions,
  filterOptions,
}: {
  paginationOptions: IPaginationOptions
  filterOptions: TUserFilterOptions
}) => {
  const { page, limit, sortBy, sortOrder, skip } =
    paginationHelpers.calculatePagination(paginationOptions)
  const where = buildUserWhereClause(filterOptions)

  const [users, total] = await userRepository.findManyAndCount({
    where: {
      ...where,

      isDeleted: false,
    },
    skip: skip!,
    take: limit,
    orderBy: {
      [sortBy!]: sortOrder,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      status: true,
      createdAt: true,
      role: true,
      company: true,
      country: true,
    },
  })

  const totalPages = Math.ceil(total / limit!)

  return {
    users,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page! < totalPages,
      hasPrevPage: page! > 1,
    },
  }
}

const getUserById = async (id: string) => {
  const user = await userRepository.findById({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      status: true,
      role: true,
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  return user
}

const updateUser = async (id: string, userData?: UpdateUserDto) => {
  const { role, ...rest } = userData || {}

  const cleanUserData = Object.fromEntries(
    Object.entries(rest!).filter(([_, v]) => v !== undefined)
  ) as Omit<Prisma.UserUpdateInput, 'userMeta'>

  if (role) {
    cleanUserData.role = role as UserRole
  }

  if (cleanUserData.password) {
    const hashedPassword = await hashPassword(cleanUserData.password as string)
    cleanUserData.password = hashedPassword
  }

  const result = await userRepository.transaction(async tx => {
    const user = await tx.user.update({
      where: { id },
      data: {
        ...cleanUserData,
      },
    })

    if (!user) {
      throw new Error('Failed to update user')
    }

    return tx.user.findUnique({
      where: { id },
    })
  })

  return {
    user: result,
    message: 'User updated successfully',
  }
}

const changePassword = async (
  id: string,
  payload: {
    newPassword: string
    oldPassword: string
  }
) => {
  const { newPassword, oldPassword } = payload

  const userExists = await userRepository.findById({ where: { id } })

  if (!userExists) {
    throw new Error('User not found')
  }

  if (userExists.password && !(await comparePassword(oldPassword, userExists.password))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Password is incorrect')
  }

  const hashedPassword = await hashPassword(newPassword)

  const user = await userRepository.update({
    where: { id },
    data: { password: hashedPassword },
  })

  if (!user) {
    throw new Error('Failed to change password')
  }

  return {
    user,
    message: 'Password changed successfully',
  }
}

const deleteUser = async (id: string) => {
  const user = await userRepository.delete({
    where: { id },
  })

  if (!user) {
    throw new Error('Failed to delete user')
  }

  return {
    user,
    message: 'User deleted successfully',
  }
}

const userSoftDelete = async (id: string) => {
  const user = await userRepository.softDelete({
    where: { id },
    data: {},
  })
  if (!user) throw new ApiError(400, 'User not found or delete failed')
  return { message: 'User soft-deleted successfully' }
}

const retainUser = async (id: string) => {
  const user = await userRepository.restore({
    where: { id },
    data: { isDeleted: false },
  })
  if (!user) throw new ApiError(404, 'User not found or restore failed')
  return { message: 'User restored successfully' }
}

const updateUserStatus = async (id: string, status: boolean) => {
  const user = await userRepository.update({
    where: { id },
    data: { status },
  })
  if (!user) throw new ApiError(404, 'User not found or status update failed')
  return { user, message: 'User status updated successfully' }
}

export const userService = {
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
  getUserById,
  userSoftDelete,
  retainUser,
  updateUserStatus,
  changePassword,
}

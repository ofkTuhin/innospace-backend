import { paginationField } from '@/constants/pagination'
import { userFilterableFields } from '@/constants/user'
import catchAsync from '@/shared/catchAsync'
import pick from '@/shared/pick'
import sendResponse from '@/shared/sendResponse'
import { Request, Response } from 'express'
import httpStatus from 'http-status'
import { TUserFilterOptions } from './user.interface'
import { userService } from './user.service'
// TODO: Create uploadCloudinary.ts file with uploadOneCloudinary function or remove this import
// import { uploadOneCloudinary } from '@/shared/uploadCloudinary'

const createUserController = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body)

  const { phone, email, firstName, lastName } = user

  sendResponse(res, {
    success: true,
    message: 'user created successfully',
    statusCode: httpStatus.OK,
    data: {
      firstName,
      lastName,
      phone,
      email,
    },
  })
})

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const paginationOptions = pick(req.query, paginationField)

  const filterOptions = pick(req.query, userFilterableFields) as TUserFilterOptions

  const { users, meta } = await userService.getAllUsers({
    paginationOptions,
    filterOptions,
  })

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users retrieved successfully',
    data: users,
    meta,
  })
})

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params

  const user = await userService.getUserById(id as string)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User retrieved successfully',
    data: user,
  })
})

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params || req.user || {}
  const userData = req.body

  const avatarFile = req.file?.path
  // ✅ file uploaded by Multer
  // TODO: Implement uploadOneCloudinary function
  // const productAvatar = await uploadOneCloudinary(avatarFile!)
  const productAvatar = avatarFile ? { url: avatarFile } : null

  const updatedUser = await userService.updateUser(userId as string, {
    ...userData,
    avatar: productAvatar?.url || undefined,
  })
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: updatedUser.message,
    data: updatedUser.user,
  })
})

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user || {}

  const result = await userService.changePassword(userId, req.body)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result.user,
  })
})

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params || {}

  const deletedUser = await userService.deleteUser(id as string)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: deletedUser.message,
    data: deletedUser.user,
  })
})

const userSoftDelete = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.userSoftDelete(req.params.id as string)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
  })
})

const retainUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.retainUser(req.params.id as string)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
  })
})

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.updateUserStatus(req.params.id as string, req.body.status)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result.user,
  })
})

export const userController = {
  createUserController,
  getAllUsers,
  getUserById,
  deleteUser,
  updateUser,
  userSoftDelete,
  retainUser,
  updateUserStatus,
  changePassword,
}

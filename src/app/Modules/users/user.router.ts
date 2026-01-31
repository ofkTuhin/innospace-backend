import checkAuth from '@/app/middleware/checkAuth'
import zodValidationHandler from '@/app/middleware/zodValidationHandler'
import { paramsSchema } from '@/shared/paramsValidation'
import express from 'express'
import { userController } from './user.controller'
import { userValidation } from './user.validation'
import { upload } from '@/app/middleware/uploadImage'
import { parseFormDataFields } from '@/app/middleware/parseFormData'
import {
  registrationRateLimiter,
  searchRateLimiter,
  fileUploadRateLimiter,
  updateRateLimiter,
  deleteRateLimiter,
  strictRateLimiter,
} from '@/app/middleware/rateLimiter'
import { validateFileUpload, validatePagination } from '@/app/middleware/security'

const router = express.Router()

router.post(
  '/',
  checkAuth('ADMIN'),
  registrationRateLimiter,
  zodValidationHandler(userValidation.createUserSchema),
  userController.createUserController
)

router.get('/', checkAuth(), searchRateLimiter, validatePagination, userController.getAllUsers)

router.get('/:id', checkAuth(), userController.getUserById)

router.patch(
  '/',
  checkAuth(),
  fileUploadRateLimiter,
  upload.single('avatar'),
  validateFileUpload,
  parseFormDataFields,
  zodValidationHandler(userValidation.updateUserSchema),
  userController.updateUser
)

router.patch(
  '/:userId',
  checkAuth(),
  fileUploadRateLimiter,
  upload.single('avatar'),
  validateFileUpload,
  parseFormDataFields,
  zodValidationHandler(userValidation.updateUserSchema),
  userController.updateUser
)

router.patch('/change-password', checkAuth(), strictRateLimiter, userController.changePassword)

router.delete(
  '/:id',
  checkAuth(),
  deleteRateLimiter,
  zodValidationHandler(paramsSchema('id')),
  userController.deleteUser
)

router.patch('/soft-delete/:id', userController.userSoftDelete)
router.patch('/retain/:id', userController.retainUser)
router.patch('/status/:id', userController.updateUserStatus)

export const userRouter = router

import { UserRole } from 'generated/prisma'
import { z } from 'zod'

export const createUserSchema = z.object({
  body: z
    .object({
      firstName: z
        .string()
        .min(2, 'First Name must be at least 2 characters')
        .max(50, 'First Name must be between 2 and 50 characters'),

      lastName: z
        .string()
        .min(2, 'Last Name must be at least 2 characters')
        .max(50, 'Last Name must be between 2 and 50 characters'),

      email: z.string().email('Email must be a valid email'),

      password: z.string().min(8, 'Password must be at least 8 characters'),

      phoneNumber: z
        .string()
        .regex(
          /^(\+\d{1,4}\s?)?(\d{1,4}[-.\s]?)?\(?\d{1,6}\)?[-.\s]?\d{1,9}([-.\s]?\d{1,5})?$/,
          'Phone number must be a valid number'
        )
        .optional(),
      company: z.string().optional(),

      avatar: z.string().url('Avatar must be a valid URL').optional(),

      registrationStatus: z.string().optional(),

      role: z.enum(['ADMIN', 'OFFICER'], {
        errorMap: () => ({ message: 'Role must be either ADMIN or OFFICER' }),
      }),
      country: z.string().optional(),

      status: z.boolean().optional(),
      isVerified: z.boolean().optional(),
      isDeleted: z.boolean().optional(),

      createdBy: z.string().uuid().optional(),
    })
    .strict(),
})

export const updateUserSchema = z.object({
  body: z
    .object({
      email: z.string().email().optional(),

      firstName: z
        .string()
        .min(2, 'First Name must be at least 2 characters')
        .max(50, 'First Name must be between 2 and 50 characters')
        .optional(),

      lastName: z
        .string()
        .min(2, 'Last Name must be at least 2 characters')
        .max(50, 'Last Name must be between 2 and 50 characters')
        .optional(),

      phoneNumber: z
        .string()
        .regex(
          /^(\+\d{1,4}\s?)?(\d{1,4}[-.\s]?)?\(?\d{1,6}\)?[-.\s]?\d{1,9}([-.\s]?\d{1,5})?$/,
          'Phone number must be a valid number'
        )
        .optional(),
      password: z.string().optional(),
      company: z.string().optional(),
      country: z.string().optional(),
      avatar: z.string().url('Avatar must be a valid URL').optional(),

      registrationStatus: z.string().optional(),

      role: z.nativeEnum(UserRole).optional(),

      status: z.boolean().optional(),
      isVerified: z.boolean().optional(),
      isDeleted: z.boolean().optional(),
    })
    .strict(),
})

export type TCreateUserValidation = z.infer<typeof createUserSchema>['body']
export type TUpdateUserValidation = z.infer<typeof updateUserSchema>['body']

export const userValidation = {
  createUserSchema,
  updateUserSchema,
}

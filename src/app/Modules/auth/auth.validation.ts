import { z } from 'zod'

const loginUser = z.object({
  body: z
    .object({
      email: z.string().email('Email must be a valid email'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
    })
    .strict(),
})

export const loginValidation = {
  loginUser,
}

export type TLoginValidation = z.infer<typeof loginUser>['body']

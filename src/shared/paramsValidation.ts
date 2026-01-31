import { z } from 'zod'

export const paramsSchema = (paramName: string = 'id') =>
  z.object({
    params: z.object({
      [paramName]: z.string().uuid({ message: `Invalid ${paramName}: must be a valid UUID` }),
    }),
  })

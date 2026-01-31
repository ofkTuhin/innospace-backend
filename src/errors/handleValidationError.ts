import { Prisma } from 'generated/prisma'

import { IGenericErrorResponse } from '../types/common'

const handleValidationError = (
  error: Prisma.PrismaClientValidationError
): IGenericErrorResponse => {
  const errors = [
    {
      path: '',
      message: error.message,
    },
  ]
  const statusCode = 400
  return {
    statusCode,
    message: 'Validation Error',
    errorMessages: errors,
  }
}

export default handleValidationError

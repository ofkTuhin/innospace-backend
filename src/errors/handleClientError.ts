import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import httpStatus from 'http-status'
import { IGenericErrorMessage } from '../types/common'

const handleClientError = (error: PrismaClientKnownRequestError) => {
  let errors: IGenericErrorMessage[] = []
  let message = ''
  let statusCode = 400

  // console.log(error.code);
  if (error.code === 'P2025') {
    message = (error.meta?.cause as string) || 'Record not found!'
    statusCode = httpStatus.NOT_FOUND
    errors = [
      {
        path: error.meta?.target ? error.meta.target.toString() : '',
        message,
      },
    ]
  } else if (error.code === 'P2003') {
    if (error.message.includes('delete()` invocation:')) {
      message = 'Delete failed'
      errors = [
        {
          path: error.meta?.target ? error.meta.target.toString() : '',
          message,
        },
      ]
    } else if (error.message.includes('update()')) {
      message = 'Update failed'
      errors = [
        {
          path: error.meta?.target ? error.meta.target.toString() : '',
          message,
        },
      ]
    } else if (error.message.includes('create()')) {
      message = 'Create failed. Check your data'
      errors = [
        {
          path: error.meta?.target ? error.meta.target.toString() : '',
          message,
        },
      ]
    }
  } else if (error.code === 'P2002') {
    if (error.message.includes('Unique constraint failed')) {
      statusCode = httpStatus.CONFLICT
      message = 'Same data already exists'
      errors = [
        {
          path: error.meta?.target ? error.meta.target.toString() : '',
          message,
        },
      ]
    }
  }

  return {
    statusCode,
    message,
    errorMessages: errors,
  }
}

export default handleClientError

//"//\nInvalid `prisma.semesterRegistration.delete()` invocation:\n\n\nAn operation failed because it depends on one or more records that were required but not found. Record to delete does not exist.",

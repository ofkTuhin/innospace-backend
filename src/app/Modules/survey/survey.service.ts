import ApiError from '@/errors/ApiError'
import { paginationHelpers } from '@/helper/paginationHelper'
import prisma from '@/shared/prisma'
import { IPaginationOptions } from '@/types/pagination'
import { Prisma, SurveyFieldType, UserRole } from 'generated/prisma'
import httpStatus from 'http-status'
import { CreateSurveyDto, SubmitSurveyDto, UpdateSurveyDto } from './survey.dto'
import { ISurveyFilterOptions } from './survey.interface'
import { surveyRepository } from './survey.repository'
import { surveySubmissionRepository } from './surveySubmission.repository'

const createSurvey = async (surveyData: CreateSurveyDto, userId: string) => {
  // Verify user is an admin
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user || user.role !== UserRole.ADMIN) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only admins can create surveys')
  }

  // Prepare fields with order indices
  const fields = surveyData.fields.map((field, index) => ({
    ...field,
    orderIndex: field.orderIndex ?? index,
  }))

  const survey = await surveyRepository.createWithFields({
    title: surveyData.title,
    description: surveyData.description,
    createdById: userId,
    fields,
  })

  return survey
}

const getAllSurveys = async (
  filters: ISurveyFilterOptions,
  paginationOptions: IPaginationOptions,
  userRole?: UserRole
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions)

  const whereConditions: Prisma.SurveyWhereInput[] = []

  // Search by title or description
  if (filters.searchTerm) {
    whereConditions.push({
      OR: [
        { title: { contains: filters.searchTerm, mode: 'insensitive' } },
        { description: { contains: filters.searchTerm, mode: 'insensitive' } },
      ],
    })
  }

  // Filter by active status
  if (filters.isActive !== undefined) {
    whereConditions.push({ isActive: filters.isActive })
  }

  // Officers can only see active surveys
  if (userRole === UserRole.OFFICER) {
    whereConditions.push({ isActive: true })
  }

  const where: Prisma.SurveyWhereInput = whereConditions.length > 0 ? { AND: whereConditions } : {}

  const surveys = await surveyRepository.findAllWithFields(where)

  const total = await prisma.survey.count({ where })

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: surveys.slice(skip, skip + limit),
  }
}

const getSurveyById = async (id: string, userRole?: UserRole) => {
  const survey = await surveyRepository.findByIdWithFields(id)

  if (!survey) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Survey not found')
  }

  // Officers can only view active surveys
  if (userRole === UserRole.OFFICER && !survey.isActive) {
    throw new ApiError(httpStatus.FORBIDDEN, 'This survey is not available')
  }

  return survey
}

const updateSurvey = async (id: string, updateData: UpdateSurveyDto, userId: string) => {
  // Verify user is an admin
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user || user.role !== UserRole.ADMIN) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only admins can update surveys')
  }

  const existingSurvey = await surveyRepository.findById({ where: { id } })

  if (!existingSurvey) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Survey not found')
  }

  // Prepare fields with order indices if provided
  const fields = updateData.fields?.map((field, index) => ({
    ...field,
    orderIndex: field.orderIndex ?? index,
  }))

  const updatedSurvey = await surveyRepository.updateWithFields(id, {
    title: updateData.title,
    description: updateData.description,
    isActive: updateData.isActive,
    fields,
  })

  return updatedSurvey
}

const deleteSurvey = async (id: string, userId: string) => {
  // Verify user is an admin
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user || user.role !== UserRole.ADMIN) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only admins can delete surveys')
  }

  const survey = await surveyRepository.findById({ where: { id } })

  if (!survey) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Survey not found')
  }

  await surveyRepository.delete({ where: { id } })

  return { message: 'Survey deleted successfully' }
}

const submitSurvey = async (surveyId: string, submissionData: SubmitSurveyDto, userId: string) => {
  // Verify user is an officer
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user || user.role !== UserRole.OFFICER) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only officers can submit surveys')
  }

  // Check if survey exists and is active
  const survey = await surveyRepository.findByIdWithFields(surveyId)

  if (!survey) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Survey not found')
  }

  if (!survey.isActive) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This survey is not active')
  }

  // Check if user has already submitted
  const hasSubmitted = await surveySubmissionRepository.checkUserAlreadySubmitted(surveyId, userId)

  if (hasSubmitted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You have already submitted this survey')
  }

  // Validate all answers
  const fieldMap = new Map(survey.fields.map(field => [field.id, field]))

  // Check all required fields are answered
  const requiredFields = survey.fields.filter(field => field.isRequired)
  const answeredFieldIds = new Set(submissionData.answers.map(ans => ans.fieldId))

  for (const requiredField of requiredFields) {
    if (!answeredFieldIds.has(requiredField.id)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Required field "${requiredField.label}" is missing`
      )
    }
  }

  // Validate each answer
  for (const answer of submissionData.answers) {
    const field = fieldMap.get(answer.fieldId)

    if (!field) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid field ID: ${answer.fieldId}`)
    }

    // Validate answer based on field type
    if (field.fieldType === SurveyFieldType.RADIO && answer.answer.length !== 1) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Radio field "${field.label}" must have exactly one answer`
      )
    }

    if (
      (field.fieldType === SurveyFieldType.CHECKBOX ||
        field.fieldType === SurveyFieldType.RADIO ||
        field.fieldType === SurveyFieldType.SELECT) &&
      field.options.length > 0
    ) {
      const invalidOptions = answer.answer.filter(ans => !field.options.includes(ans))
      if (invalidOptions.length > 0) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `Invalid options for field "${field.label}": ${invalidOptions.join(', ')}`
        )
      }
    }
  }

  // Create submission
  const submission = await surveySubmissionRepository.createSubmissionWithAnswers({
    surveyId,
    submittedById: userId,
    answers: submissionData.answers,
  })

  return submission
}

const getSurveySubmissions = async (surveyId: string, userId: string) => {
  // Verify user is an admin
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user || user.role !== UserRole.ADMIN) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only admins can view survey submissions')
  }

  const survey = await surveyRepository.findById({ where: { id: surveyId } })

  if (!survey) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Survey not found')
  }

  const submissions = await surveyRepository.getSubmissions(surveyId)

  return submissions
}

export const surveyService = {
  createSurvey,
  getAllSurveys,
  getSurveyById,
  updateSurvey,
  deleteSurvey,
  submitSurvey,
  getSurveySubmissions,
}

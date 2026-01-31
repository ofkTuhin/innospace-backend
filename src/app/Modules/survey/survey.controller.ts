import { paginationField } from '@/constants/pagination'
import catchAsync from '@/shared/catchAsync'
import pick from '@/shared/pick'
import sendResponse from '@/shared/sendResponse'
import { Request, Response } from 'express'
import httpStatus from 'http-status'
import { ISurveyFilterOptions } from './survey.interface'
import { surveyService } from './survey.service'

const createSurvey = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId as string
  const survey = await surveyService.createSurvey(req.body, userId)

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Survey created successfully',
    data: survey,
  })
})

const getAllSurveys = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'isActive']) as ISurveyFilterOptions
  const paginationOptions = pick(req.query, paginationField)
  const userRole = req.user?.role

  const result = await surveyService.getAllSurveys(filters, paginationOptions, userRole)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Surveys retrieved successfully',
    meta: result.meta,
    data: result.data,
  })
})

const getSurveyById = catchAsync(async (req: Request, res: Response) => {
  const { surveyId } = req.params
  const userRole = req.user?.role

  const survey = await surveyService.getSurveyById(surveyId, userRole)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Survey retrieved successfully',
    data: survey,
  })
})

const updateSurvey = catchAsync(async (req: Request, res: Response) => {
  const { surveyId } = req.params
  const userId = req.user?.userId as string

  const survey = await surveyService.updateSurvey(surveyId, req.body, userId)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Survey updated successfully',
    data: survey,
  })
})

const deleteSurvey = catchAsync(async (req: Request, res: Response) => {
  const { surveyId } = req.params
  const userId = req.user?.userId as string

  const result = await surveyService.deleteSurvey(surveyId, userId)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
  })
})

const submitSurvey = catchAsync(async (req: Request, res: Response) => {
  const { surveyId } = req.params
  const userId = req.user?.userId as string

  const submission = await surveyService.submitSurvey(surveyId, req.body, userId)

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Survey submitted successfully',
    data: submission,
  })
})

const getSurveySubmissions = catchAsync(async (req: Request, res: Response) => {
  const { surveyId } = req.params
  const userId = req.user?.userId as string

  const submissions = await surveyService.getSurveySubmissions(surveyId, userId)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Survey submissions retrieved successfully',
    data: submissions,
  })
})

export const surveyController = {
  createSurvey,
  getAllSurveys,
  getSurveyById,
  updateSurvey,
  deleteSurvey,
  submitSurvey,
  getSurveySubmissions,
}

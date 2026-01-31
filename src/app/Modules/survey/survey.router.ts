import checkAuth from '@/app/middleware/checkAuth'
import zodValidationHandler from '@/app/middleware/zodValidationHandler'
import { paramsSchema } from '@/shared/paramsValidation'
import express from 'express'
import { surveyController } from './survey.controller'
import { createSurveySchema, submitSurveySchema, updateSurveySchema } from './survey.validation'

const router = express.Router()

// Admin routes - Create, update, delete surveys and view submissions
router.post(
  '/',
  checkAuth('ADMIN'),
  zodValidationHandler(createSurveySchema),
  surveyController.createSurvey
)

router.get('/', checkAuth('ADMIN', 'OFFICER'), surveyController.getAllSurveys)

router.get(
  '/:surveyId',
  checkAuth('ADMIN', 'OFFICER'),
  zodValidationHandler(paramsSchema('surveyId')),
  surveyController.getSurveyById
)

router.patch(
  '/:surveyId',
  checkAuth('ADMIN'),
  zodValidationHandler(paramsSchema('surveyId')),
  zodValidationHandler(updateSurveySchema),
  surveyController.updateSurvey
)

router.delete(
  '/:surveyId',
  checkAuth('ADMIN'),
  zodValidationHandler(paramsSchema('surveyId')),
  surveyController.deleteSurvey
)

// Officer routes - Submit survey
router.post(
  '/:surveyId/submit',
  checkAuth('OFFICER'),
  zodValidationHandler(paramsSchema('surveyId')),
  zodValidationHandler(submitSurveySchema),
  surveyController.submitSurvey
)

// Admin route - Get survey submissions
router.get(
  '/:surveyId/submissions',
  checkAuth('ADMIN'),
  zodValidationHandler(paramsSchema('surveyId')),
  surveyController.getSurveySubmissions
)

export const surveyRouter = router

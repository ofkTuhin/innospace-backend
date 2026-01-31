import {
  TCreateSurveyValidation,
  TUpdateSurveyValidation,
  TSubmitSurveyValidation,
} from './survey.validation'

export type CreateSurveyDto = TCreateSurveyValidation['body']
export type UpdateSurveyDto = TUpdateSurveyValidation['body']
export type SubmitSurveyDto = TSubmitSurveyValidation['body']

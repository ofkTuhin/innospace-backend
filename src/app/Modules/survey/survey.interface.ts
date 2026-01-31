import { SurveyFieldType } from 'generated/prisma'

export interface ISurveyField {
  id?: string
  label: string
  fieldType: SurveyFieldType
  isRequired: boolean
  options?: string[]
  orderIndex?: number
}

export interface ISurvey {
  id?: string
  title: string
  description?: string
  isActive?: boolean
  fields?: ISurveyField[]
  createdById?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface ISurveySubmission {
  id?: string
  surveyId: string
  submittedById: string
  answers: ISubmissionAnswer[]
  submittedAt?: Date
}

export interface ISubmissionAnswer {
  fieldId: string
  answer: string[]
}

export interface ISurveyFilterOptions {
  searchTerm?: string
  isActive?: boolean
}

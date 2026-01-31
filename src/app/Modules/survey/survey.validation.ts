import { SurveyFieldType } from 'generated/prisma'
import { z } from 'zod'

const surveyFieldSchema = z.object({
  label: z.string().min(1, 'Field label is required'),
  fieldType: z.nativeEnum(SurveyFieldType, {
    errorMap: () => ({ message: 'Invalid field type' }),
  }),
  isRequired: z.boolean().default(false),
  options: z.array(z.string()).optional().default([]),
  orderIndex: z.number().optional().default(0),
})

export const createSurveySchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Survey title is required'),
    description: z.string().optional(),
    fields: z
      .array(surveyFieldSchema)
      .min(1, 'At least one field is required')
      .refine(
        fields => {
          return fields.every(field => {
            if (
              field.fieldType === SurveyFieldType.CHECKBOX ||
              field.fieldType === SurveyFieldType.RADIO ||
              field.fieldType === SurveyFieldType.SELECT
            ) {
              return field.options && field.options.length > 0
            }
            return true
          })
        },
        {
          message: 'CHECKBOX, RADIO, and SELECT fields must have at least one option',
        }
      ),
  }),
})

export const updateSurveySchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Survey title is required').optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
    fields: z
      .array(surveyFieldSchema)
      .optional()
      .refine(
        fields => {
          if (!fields || fields.length === 0) return true
          return fields.every(field => {
            if (
              field.fieldType === SurveyFieldType.CHECKBOX ||
              field.fieldType === SurveyFieldType.RADIO ||
              field.fieldType === SurveyFieldType.SELECT
            ) {
              return field.options && field.options.length > 0
            }
            return true
          })
        },
        {
          message: 'CHECKBOX, RADIO, and SELECT fields must have at least one option',
        }
      ),
  }),
})

export const submitSurveySchema = z.object({
  body: z.object({
    answers: z.array(
      z.object({
        fieldId: z.string().uuid('Invalid field ID'),
        answer: z.array(z.string()).min(1, 'Answer is required'),
      })
    ),
  }),
})

export type TCreateSurveyValidation = z.infer<typeof createSurveySchema>
export type TUpdateSurveyValidation = z.infer<typeof updateSurveySchema>
export type TSubmitSurveyValidation = z.infer<typeof submitSurveySchema>

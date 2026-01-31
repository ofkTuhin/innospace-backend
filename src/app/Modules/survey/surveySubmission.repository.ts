import prisma from '@/shared/prisma'
import { Prisma } from 'generated/prisma'
import { BaseRepository } from '../baseRepository/baseRepository'

class SurveySubmissionRepository extends BaseRepository<Prisma.SurveySubmissionDelegate> {
  constructor() {
    super(prisma.surveySubmission)
  }

  async createSubmissionWithAnswers(data: {
    surveyId: string
    submittedById: string
    answers: Array<{
      fieldId: string
      answer: string[]
    }>
  }) {
    return await prisma.surveySubmission.create({
      data: {
        surveyId: data.surveyId,
        submittedById: data.submittedById,
        answers: {
          create: data.answers,
        },
      },
      include: {
        answers: {
          include: {
            field: true,
          },
        },
        survey: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })
  }

  async checkUserAlreadySubmitted(surveyId: string, userId: string) {
    const existingSubmission = await prisma.surveySubmission.findFirst({
      where: {
        surveyId,
        submittedById: userId,
      },
    })
    return !!existingSubmission
  }
}

export const surveySubmissionRepository = new SurveySubmissionRepository()

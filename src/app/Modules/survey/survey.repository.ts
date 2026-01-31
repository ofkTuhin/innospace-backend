import prisma from '@/shared/prisma'
import { Prisma, SurveyFieldType } from 'generated/prisma'
import { BaseRepository } from '../baseRepository/baseRepository'

class SurveyRepository extends BaseRepository<Prisma.SurveyDelegate> {
  constructor() {
    super(prisma.survey)
  }

  async findByIdWithFields(id: string) {
    return await prisma.survey.findUnique({
      where: { id },
      include: {
        fields: {
          orderBy: { orderIndex: 'asc' },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })
  }

  async findAllWithFields(where?: Prisma.SurveyWhereInput) {
    return await prisma.survey.findMany({
      where,
      include: {
        fields: {
          orderBy: { orderIndex: 'asc' },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async createWithFields(data: {
    title: string
    description?: string
    createdById: string
    fields: Array<{
      label: string
      fieldType: SurveyFieldType
      isRequired: boolean
      options?: string[]
      orderIndex: number
    }>
  }) {
    return await prisma.survey.create({
      data: {
        title: data.title,
        description: data.description,
        createdById: data.createdById,
        fields: {
          create: data.fields,
        },
      },
      include: {
        fields: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    })
  }

  async updateWithFields(
    id: string,
    data: {
      title?: string
      description?: string
      isActive?: boolean
      fields?: Array<{
        label: string
        fieldType: SurveyFieldType
        isRequired: boolean
        options?: string[]
        orderIndex: number
      }>
    }
  ) {
    // If fields are being updated, delete old ones and create new ones
    if (data.fields) {
      await prisma.surveyField.deleteMany({
        where: { surveyId: id },
      })
    }

    return await prisma.survey.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.fields && {
          fields: {
            create: data.fields,
          },
        }),
      },
      include: {
        fields: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    })
  }

  async getSubmissions(surveyId: string) {
    return await prisma.surveySubmission.findMany({
      where: { surveyId },
      include: {
        submittedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        answers: {
          include: {
            field: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    })
  }
}

export const surveyRepository = new SurveyRepository()

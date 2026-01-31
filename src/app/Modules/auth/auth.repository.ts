import config from '@/config'
import prisma from '@/shared/prisma'
import { Prisma } from 'generated/prisma'
import { BaseRepository } from '../baseRepository/baseRepository'

export class AuthRepository extends BaseRepository<Prisma.UserDelegate> {
  constructor() {
    super(prisma.user)
  }

  async findByEmail(email: string, tx = prisma) {
    return tx.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    })
  }

  async createOtp(email: string, otp: string) {
    return prisma.oTP.create({
      data: {
        email,
        otp,
        expiresAt: new Date(Date.now() + Number(config.otp.expiresIn) * 60 * 1000),
      },
    })
  }

  async findOtp(email: string) {
    return prisma.oTP.findFirst({
      where: {
        email,
      },
    })
  }

  async deleteOtp(email: string) {
    return prisma.oTP.deleteMany({
      where: { email },
    })
  }
}

export const authRepository = new AuthRepository()

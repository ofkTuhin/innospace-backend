import prisma from '@/shared/prisma'
import { Prisma } from 'generated/prisma'
import { BaseRepository } from '../baseRepository/baseRepository'

const defaultSelect = {
  id: true,
  email: true,
  password: false,
  firstName: true,
  lastName: true,
  role: true,
  phoneNumber: true,
  status: true,
  country: true,
} as const

type UserSelect = {
  [K in keyof typeof defaultSelect]: boolean
}

export class UserRepository extends BaseRepository<Prisma.UserDelegate> {
  constructor() {
    super(prisma.user)
  }

  // custom method
  async findByEmailOrMobileNumber(
    email: string,
    phoneNumber: string,
    select?: Partial<UserSelect>
  ) {
    return this.delegate.findFirst({
      where: { OR: [{ email }, { phoneNumber }] },
      select: {
        ...defaultSelect,
        ...select,
      },
    })
  }

  async findByEmail(email: string) {
    return this.delegate.findUnique({
      where: { email },
      select: {
        ...defaultSelect,
        password: true,
      },
    })
  }

  async findManyAndCount(args: any) {
    return super.findManyAndCount(args)
  }

  async transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>) {
    return prisma.$transaction(fn)
  }
}

export const userRepository = new UserRepository()

// base.repository.ts

import prisma from '@/shared/prisma'
import { Prisma, PrismaClient } from '../../../../generated/prisma'

export type DelegateWithCrud = {
  create: (...args: any[]) => any
  update: (...args: any[]) => any
  delete: (...args: any[]) => any
  findUnique: (...args: any[]) => any
  findMany: (...args: any[]) => any
  count: (...args: any[]) => any
  createMany: (...args: any[]) => any
}

export class BaseRepository<TDelegate extends DelegateWithCrud> {
  constructor(protected readonly delegate: TDelegate) {}

  async create<T extends Parameters<TDelegate['create']>[0]>(
    args: T,
    tx: PrismaClient | Prisma.TransactionClient = prisma
  ) {
    return (this.delegate as any).create.call(tx, args)
  }

  async createMany<T extends Parameters<TDelegate['createMany']>[0]>(
    args: T,
    tx: PrismaClient | Prisma.TransactionClient = prisma
  ) {
    return (this.delegate as any).createMany.call(tx, args)
  }

  async update<T extends Parameters<TDelegate['update']>[0]>(
    args: T,
    tx: PrismaClient | Prisma.TransactionClient = prisma
  ) {
    return (this.delegate as any).update.call(tx, args)
  }

  async delete<T extends Parameters<TDelegate['delete']>[0]>(
    args: T,
    tx: PrismaClient | Prisma.TransactionClient = prisma
  ) {
    return (this.delegate as any).delete.call(tx, args)
  }

  async findById<T extends Parameters<TDelegate['findUnique']>[0]>(
    args: T,
    tx: PrismaClient | Prisma.TransactionClient = prisma
  ) {
    return (this.delegate as any).findUnique.call(tx, args)
  }

  async findAll<T extends Parameters<TDelegate['findMany']>[0]>(
    args?: T,
    tx: PrismaClient | Prisma.TransactionClient = prisma
  ) {
    return (this.delegate as any).findMany.call(tx, args)
  }

  async findManyAndCount<
    T extends Parameters<TDelegate['findMany']>[0],
    W extends Parameters<TDelegate['count']>[0],
  >(args: T & W, tx: PrismaClient | Prisma.TransactionClient = prisma): Promise<[any[], number]> {
    const [items, total] = await Promise.all([
      (this.delegate as any).findMany.call(tx, args),
      (this.delegate as any).count.call(tx, { where: args.where }),
    ])
    return [items, total]
  }

  async softDelete<T extends Parameters<TDelegate['update']>[0]>(
    args: T,
    tx: PrismaClient | Prisma.TransactionClient = prisma
  ) {
    return (this.delegate as any).update.call(tx, {
      ...args,
      data: {
        ...args.data,
        isDeleted: true,
        deletedAt: new Date(),
        status: false,
      },
    })
  }

  async restore<T extends Parameters<TDelegate['update']>[0]>(
    args: T,
    tx: PrismaClient | Prisma.TransactionClient = prisma
  ) {
    return (this.delegate as any).update.call(tx, {
      ...args,
      data: {
        ...args.data,
        isDeleted: false,
        deletedAt: null,
        status: true,
      },
    })
  }

  async updateStatus<T extends Parameters<TDelegate['update']>[0]>(
    args: T,
    tx: PrismaClient | Prisma.TransactionClient = prisma
  ) {
    return (this.delegate as any).update.call(tx, {
      ...args,
      data: {
        ...args.data,
        status: args.data.status,
      },
    })
  }
}

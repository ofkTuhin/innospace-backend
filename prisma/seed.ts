/* eslint-disable no-console */
import { PrismaClient } from '../generated/prisma'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Example password
  const hashedPassword = await bcrypt.hash('Admin@123', 10)

  // Seed Users
  const users = [
    {
      email: 'super_admin@fibre52.com',
      firstName: 'Super',
      lastName: 'Admin',
      phoneNumber: '1234567890',
      company: 'Fibre52',
    },
    {
      email: 'hshahariar@fibre52.com',
      firstName: 'Hasan',
      lastName: 'Shahariar',
      phoneNumber: '1234567891',
      company: 'Fibre52',
    },
    {
      email: 'mrosenhouse@fibre52.com',
      firstName: 'Michael',
      lastName: 'Rosenhouse',
      phoneNumber: '1234567892',
      company: 'Fibre52',
    },
    {
      email: 'lthornquist@fibre52.com',
      firstName: 'Laura',
      lastName: 'Thornquist',
      phoneNumber: '1234567893',
      company: 'Fibre52',
    },
  ]

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        company: user.company,
        role: 'ADMIN',
        status: true,
        isVerified: true,
        isDeleted: false,
      },
      create: {
        ...user,
        password: hashedPassword,
        avatar: null,
        role: 'ADMIN',
        status: true,
        isVerified: true,
        isDeleted: false,
        createdBy: null,
      },
    })
  }

  console.log('🌱 Seeding complete!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async err => {
    console.error(err)
    await prisma.$disconnect()
    process.exit(1)
  })

/* eslint-disable no-console */
import { PrismaClient } from '../generated/prisma'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Hash passwords
  const adminPassword = await bcrypt.hash('Admin@123', 10)
  const officerPassword = await bcrypt.hash('Officer@123', 10)

  // Seed Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      status: true,
      isVerified: true,
      isDeleted: false,
    },
    create: {
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      password: adminPassword,
      phoneNumber: '+1234567890',
      company: 'Innospace',
      country: 'USA',
      role: 'ADMIN',
      status: true,
      isVerified: true,
      isDeleted: false,
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // Seed Officer User
  const officer = await prisma.user.upsert({
    where: { email: 'officer@example.com' },
    update: {
      firstName: 'Officer',
      lastName: 'User',
      role: 'OFFICER',
      status: true,
      isVerified: true,
      isDeleted: false,
    },
    create: {
      email: 'officer@example.com',
      firstName: 'Officer',
      lastName: 'User',
      password: officerPassword,
      phoneNumber: '+1234567891',
      company: 'Innospace',
      country: 'USA',
      role: 'OFFICER',
      status: true,
      isVerified: true,
      isDeleted: false,
    },
  })
  console.log('✅ Officer user created:', officer.email)

  // Seed Default Surveys
  console.log('\n📋 Creating default surveys...')

  // Survey 1: Customer Satisfaction Survey
  const survey1 = await prisma.survey.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Customer Satisfaction Survey',
      isActive: true,
      createdById: admin.id,
      fields: {
        create: [
          {
            label: 'What is your full name?',
            fieldType: 'TEXT',
            isRequired: true,
            orderIndex: 1,
          },
          {
            label: 'How would you rate our service?',
            fieldType: 'RADIO',
            isRequired: true,
            options: ['Excellent', 'Good', 'Average', 'Poor'],
            orderIndex: 2,
          },
          {
            label: 'Which features do you use most?',
            fieldType: 'CHECKBOX',
            isRequired: false,
            options: [
              'Dashboard Analytics',
              'Reporting Tools',
              'Data Export',
              'API Integration',
              'Mobile App',
            ],
            orderIndex: 3,
          },
          {
            label: 'What is your department?',
            fieldType: 'SELECT',
            isRequired: true,
            options: ['Sales', 'Marketing', 'Engineering', 'HR', 'Finance'],
            orderIndex: 4,
          },
          {
            label: 'Additional comments or feedback',
            fieldType: 'TEXT',
            isRequired: false,
            orderIndex: 5,
          },
        ],
      },
    },
  })
  console.log('✅ Survey created:', survey1.title)

  // Survey 2: Employee Feedback Survey
  const survey2 = await prisma.survey.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      title: 'Employee Feedback Survey',
      isActive: true,
      createdById: admin.id,
      fields: {
        create: [
          {
            label: 'Employee Name',
            fieldType: 'TEXT',
            isRequired: true,
            orderIndex: 1,
          },
          {
            label: 'How satisfied are you with your work environment?',
            fieldType: 'RADIO',
            isRequired: true,
            options: [
              'Very Satisfied',
              'Satisfied',
              'Neutral',
              'Dissatisfied',
              'Very Dissatisfied',
            ],
            orderIndex: 2,
          },
          {
            label: 'What benefits are most important to you?',
            fieldType: 'CHECKBOX',
            isRequired: false,
            options: [
              'Health Insurance',
              'Retirement Plan',
              'Paid Time Off',
              'Remote Work',
              'Professional Development',
            ],
            orderIndex: 3,
          },
          {
            label: 'Overall company rating (1-5)',
            fieldType: 'SELECT',
            isRequired: true,
            options: ['5 - Excellent', '4 - Good', '3 - Average', '2 - Below Average', '1 - Poor'],
            orderIndex: 4,
          },
        ],
      },
    },
  })
  console.log('✅ Survey created:', survey2.title)

  // Survey 3: Product Feedback Survey
  const survey3 = await prisma.survey.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      title: 'Product Feedback Survey',
      isActive: true,
      createdById: admin.id,
      fields: {
        create: [
          {
            label: 'Product Name',
            fieldType: 'SELECT',
            isRequired: true,
            options: ['Product A', 'Product B', 'Product C', 'Product D'],
            orderIndex: 1,
          },
          {
            label: 'Would you recommend this product?',
            fieldType: 'RADIO',
            isRequired: true,
            options: ['Definitely', 'Probably', 'Not Sure', 'Probably Not', 'Definitely Not'],
            orderIndex: 2,
          },
          {
            label: 'What improvements would you suggest?',
            fieldType: 'TEXT',
            isRequired: false,
            orderIndex: 3,
          },
        ],
      },
    },
  })
  console.log('✅ Survey created:', survey3.title)

  console.log('\n🌱 Seeding complete!')
  console.log('\n📝 Login credentials:')
  console.log('Admin  -> Email: admin@example.com    | Password: Admin@123')
  console.log('Officer-> Email: officer@example.com  | Password: Officer@123')
  console.log('\n📊 Default Surveys:')
  console.log('1. Customer Satisfaction Survey')
  console.log('2. Employee Feedback Survey')
  console.log('3. Product Feedback Survey')
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

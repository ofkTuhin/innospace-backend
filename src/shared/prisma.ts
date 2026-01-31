import { PrismaClient } from '../../generated/prisma'

const prisma = new PrismaClient({
  errorFormat: 'minimal',
  transactionOptions: {
    maxWait: 10000, // Maximum time to wait to start a transaction (10 seconds)
    timeout: 30000, // Maximum time a transaction can run (30 seconds)
  },
})

export default prisma

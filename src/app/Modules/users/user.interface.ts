import { UserRole } from 'generated/prisma'

export type TUserFilterOptions = {
  searchTerm?: string
  role?: UserRole
}

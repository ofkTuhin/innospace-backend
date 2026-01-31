import * as crypto from 'crypto'

/**
 * Generates a 6-digit OTP
 * @returns 6-digit OTP string
 */
export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString()
}

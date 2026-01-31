import path from 'path'

import dotenv from 'dotenv'

dotenv.config({ path: path.join(process.cwd(), '.env') })

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,

  // jwt
  jwt: {
    secret: process.env.JWT_SECRET,
    refresh_secret: process.env.JWT_REFRESH_SECRET,
    expires_in: process.env.JWT_EXPIRES_IN,
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  },
  client_url: process.env.CLIENT_URL,

  // email -> node mailer
  mail: {
    email: process.env.EMAIL,
    password: process.env.EMAIL_PASSWORD,
  },

  otp: {
    expiresIn: process.env.OTP_EXPIRES_IN,
  },

  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  },
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },
  aws: {
    secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
    access_key_id: process.env.AWS_ACCESS_KEY_ID,
    region: process.env.AWS_REGION,
    bucket_name: process.env.AWS_BUCKET_NAME,
  },
}

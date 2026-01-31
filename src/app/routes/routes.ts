import express from 'express'

import { authRouter } from '../Modules/auth/auth.router'
import { userRouter } from '../Modules/users/user.router'
import { surveyRouter } from '../Modules/survey/survey.router'

const router = express.Router()

const moduleRoutes = [
  {
    path: '/user',
    route: userRouter,
  },

  {
    path: '/auth',
    route: authRouter,
  },

  {
    path: '/survey',
    route: surveyRouter,
  },
]

moduleRoutes.forEach(route => router.use(route.path, route.route))
export default router

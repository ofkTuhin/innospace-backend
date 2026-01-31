import { NextFunction, Request, Response } from 'express'
import { AnyZodObject, ZodEffects } from 'zod'
const zodValidationHandler =
  (schema: AnyZodObject | ZodEffects<AnyZodObject>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        headers: req.headers,
        cookies: req.cookies,
      })
      next()
    } catch (error) {
      next(error)
    }
  }

export default zodValidationHandler

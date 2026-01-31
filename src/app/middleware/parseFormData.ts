import { NextFunction, Request, Response } from 'express'

export const parseFormDataFields = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body.data === 'string') {
    try {
      req.body = JSON.parse(req.body.data)
    } catch {
      return res.status(400).json({ error: 'Invalid JSON in user Data' })
    }
  }
  next()
}

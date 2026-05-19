import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt'

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1]

  if (!token) {
    res.status(401).json({ message: 'Не авторизован' })
    return
  }

  const payload = verifyAccessToken(token)

  if (!payload) {
    res.status(401).json({ message: 'Токен недействителен', code: 'TOKEN_EXPIRED' })
    return
  }

  req.user = { id: payload.id, email: payload.email, name: payload.name }
  next()
}

import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setTokenCookies,
  clearTokenCookies,
} from '../utils/jwt'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const register = async (req: Request, res: Response): Promise<void> => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Неверные данные', errors: parsed.error.flatten() })
    return
  }

  const { email, password, name } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    res.status(409).json({ message: 'Пользователь с таким email уже существует' })
    return
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { email, passwordHash, name },
    select: { id: true, email: true, name: true, avatarUrl: true, createdAt: true },
  })

  const accessToken = generateAccessToken({ id: user.id, email: user.email, name: user.name })
  const refreshToken = generateRefreshToken({ id: user.id, email: user.email, name: user.name })
  setTokenCookies(res, accessToken, refreshToken)

  res.status(201).json({ user, accessToken })
}

export const login = async (req: Request, res: Response): Promise<void> => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Неверные данные' })
    return
  }

  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    res.status(401).json({ message: 'Неверный email или пароль' })
    return
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    res.status(401).json({ message: 'Неверный email или пароль' })
    return
  }

  const accessToken = generateAccessToken({ id: user.id, email: user.email, name: user.name })
  const refreshToken = generateRefreshToken({ id: user.id, email: user.email, name: user.name })
  setTokenCookies(res, accessToken, refreshToken)

  res.json({
    user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl, createdAt: user.createdAt },
    accessToken,
  })
}

export const logout = (_req: Request, res: Response): void => {
  clearTokenCookies(res)
  res.json({ message: 'Выход выполнен' })
}

export const logoutAll = (_req: Request, res: Response): void => {
  clearTokenCookies(res)
  res.json({ message: 'Выход выполнен' })
}

export const refresh = (req: Request, res: Response): void => {
  const token = req.cookies.refreshToken
  if (!token) {
    res.status(401).json({ message: 'Нет refresh токена' })
    return
  }

  const payload = verifyRefreshToken(token)
  if (!payload) {
    clearTokenCookies(res)
    res.status(401).json({ message: 'Токен недействителен', code: 'TOKEN_EXPIRED' })
    return
  }

  const newAccessToken = generateAccessToken({ id: payload.id, email: payload.email, name: payload.name })
  const newRefreshToken = generateRefreshToken({ id: payload.id, email: payload.email, name: payload.name })
  setTokenCookies(res, newAccessToken, newRefreshToken)

  res.json({ accessToken: newAccessToken })
}

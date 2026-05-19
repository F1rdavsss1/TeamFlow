import { Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  avatarUrl: z.string().optional(),
})

export const getProfile = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, email: true, name: true, avatarUrl: true, createdAt: true, updatedAt: true },
  })

  if (!user) {
    res.status(404).json({ message: 'Пользователь не найден' })
    return
  }

  res.json(user)
}

export const updateProfile = async (req: Request, res: Response) => {
  const parsed = updateProfileSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Неверные данные', errors: parsed.error.flatten() })
    return
  }

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: parsed.data,
    select: { id: true, email: true, name: true, avatarUrl: true, createdAt: true, updatedAt: true },
  })

  res.json(user)
}

export const getUserById = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: { id: true, email: true, name: true, avatarUrl: true },
  })

  if (!user) {
    res.status(404).json({ message: 'Пользователь не найден' })
    return
  }

  res.json(user)
}

// поиск пользователей по имени или email (исключая текущего)
export const searchUsers = async (req: Request, res: Response) => {
  const query = String(req.query.q ?? '').trim()

  if (query.length < 2) {
    res.json([])
    return
  }

  const users = await prisma.user.findMany({
    where: {
      AND: [
        { id: { not: req.user!.id } },
        {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
      ],
    },
    select: { id: true, email: true, name: true, avatarUrl: true },
    take: 10,
  })

  res.json(users)
}

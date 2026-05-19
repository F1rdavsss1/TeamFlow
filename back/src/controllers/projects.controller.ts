import { Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { UserRole } from '@prisma/client'

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

const updateProjectSchema = createProjectSchema.partial().extend({
  status: z.enum(['ACTIVE', 'ARCHIVED', 'COMPLETED']).optional(),
})

const addMemberSchema = z.object({
  userId: z.string().uuid(),
  role: z.nativeEnum(UserRole),
})

export const getProjects = async (req: Request, res: Response) => {
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: req.user!.id },
        { members: { some: { userId: req.user!.id } } },
      ],
    },
    include: {
      owner: { select: { id: true, name: true, avatarUrl: true } },
      members: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      },
      _count: { select: { tasks: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  res.json(projects)
}

export const getProjectById = async (req: Request, res: Response) => {
  const project = await prisma.project.findFirst({
    where: {
      id: req.params.id,
      OR: [
        { ownerId: req.user!.id },
        { members: { some: { userId: req.user!.id } } },
      ],
    },
    include: {
      owner: { select: { id: true, name: true, avatarUrl: true } },
      members: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      },
      _count: { select: { tasks: true } },
    },
  })

  if (!project) {
    res.status(404).json({ message: 'Проект не найден' })
    return
  }

  res.json(project)
}

export const createProject = async (req: Request, res: Response) => {
  const parsed = createProjectSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Неверные данные', errors: parsed.error.flatten() })
    return
  }

  const { name, description, startDate, endDate } = parsed.data

  const project = await prisma.project.create({
    data: {
      name,
      description,
      ownerId: req.user!.id,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      members: {
        create: { userId: req.user!.id, role: UserRole.OWNER },
      },
    },
    include: {
      owner: { select: { id: true, name: true, avatarUrl: true } },
      members: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      },
    },
  })

  res.status(201).json(project)
}

export const updateProject = async (req: Request, res: Response) => {
  const parsed = updateProjectSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Неверные данные', errors: parsed.error.flatten() })
    return
  }

  const project = await prisma.project.findFirst({
    where: { id: req.params.id, ownerId: req.user!.id },
  })

  if (!project) {
    res.status(403).json({ message: 'Нет доступа' })
    return
  }

  const { startDate, endDate, ...rest } = parsed.data

  const updated = await prisma.project.update({
    where: { id: req.params.id },
    data: {
      ...rest,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    },
    include: {
      owner: { select: { id: true, name: true, avatarUrl: true } },
      members: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      },
    },
  })

  res.json(updated)
}

export const deleteProject = async (req: Request, res: Response) => {
  const project = await prisma.project.findFirst({
    where: { id: req.params.id, ownerId: req.user!.id },
  })

  if (!project) {
    res.status(403).json({ message: 'Нет доступа' })
    return
  }

  await prisma.project.delete({ where: { id: req.params.id } })
  res.status(204).send()
}

export const addMember = async (req: Request, res: Response) => {
  const parsed = addMemberSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Неверные данные' })
    return
  }

  const project = await prisma.project.findFirst({
    where: { id: req.params.id, ownerId: req.user!.id },
  })

  if (!project) {
    res.status(403).json({ message: 'Нет доступа' })
    return
  }

  const member = await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: req.params.id, userId: parsed.data.userId } },
    update: { role: parsed.data.role },
    create: { projectId: req.params.id, userId: parsed.data.userId, role: parsed.data.role },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  })

  res.status(201).json(member)
}

export const removeMember = async (req: Request, res: Response) => {
  const project = await prisma.project.findFirst({
    where: { id: req.params.id, ownerId: req.user!.id },
  })

  if (!project) {
    res.status(403).json({ message: 'Нет доступа' })
    return
  }

  await prisma.projectMember.delete({
    where: { projectId_userId: { projectId: req.params.id, userId: req.params.userId } },
  })

  res.status(204).send()
}

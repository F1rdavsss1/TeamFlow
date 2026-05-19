import { Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { TaskStatus, TaskPriority } from '@prisma/client'

const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  assigneeId: z.string().uuid().optional(),
  dueDate: z.string().optional(),
})

const updateTaskSchema = createTaskSchema.partial().extend({
  status: z.nativeEnum(TaskStatus).optional(),
})

const commentSchema = z.object({
  content: z.string().min(1),
})

export const getTasks = async (req: Request, res: Response) => {
  const { projectId } = req.params

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: req.user!.id },
        { members: { some: { userId: req.user!.id } } },
      ],
    },
  })

  if (!project) {
    res.status(403).json({ message: 'Нет доступа' })
    return
  }

  const tasks = await prisma.task.findMany({
    where: { projectId },
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      comments: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'asc' },
      },
      attachments: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  res.json(tasks)
}

export const getTaskById = async (req: Request, res: Response) => {
  const task = await prisma.task.findUnique({
    where: { id: req.params.id },
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      comments: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'asc' },
      },
      attachments: true,
      project: { select: { id: true, name: true, ownerId: true } },
    },
  })

  if (!task) {
    res.status(404).json({ message: 'Задача не найдена' })
    return
  }

  res.json(task)
}

export const createTask = async (req: Request, res: Response) => {
  const parsed = createTaskSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Неверные данные', errors: parsed.error.flatten() })
    return
  }

  const { projectId } = req.params
  const { dueDate, ...rest } = parsed.data

  const task = await prisma.task.create({
    data: {
      ...rest,
      projectId,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    },
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      comments: true,
      attachments: true,
    },
  })

  res.status(201).json(task)
}

export const updateTask = async (req: Request, res: Response) => {
  const parsed = updateTaskSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Неверные данные', errors: parsed.error.flatten() })
    return
  }

  const { dueDate, ...rest } = parsed.data

  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: {
      ...rest,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    },
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      comments: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      },
      attachments: true,
    },
  })

  res.json(task)
}

export const updateTaskStatus = async (req: Request, res: Response) => {
  const parsed = z.object({ status: z.nativeEnum(TaskStatus) }).safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Неверный статус' })
    return
  }

  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: { status: parsed.data.status },
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      comments: true,
      attachments: true,
    },
  })

  res.json(task)
}

export const deleteTask = async (req: Request, res: Response) => {
  await prisma.task.delete({ where: { id: req.params.id } })
  res.status(204).send()
}

export const addComment = async (req: Request, res: Response) => {
  const parsed = commentSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Неверные данные' })
    return
  }

  const comment = await prisma.comment.create({
    data: {
      taskId: req.params.id,
      userId: req.user!.id,
      content: parsed.data.content,
    },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  })

  res.status(201).json(comment)
}

export const deleteComment = async (req: Request, res: Response) => {
  const comment = await prisma.comment.findUnique({ where: { id: req.params.commentId } })

  if (!comment || comment.userId !== req.user!.id) {
    res.status(403).json({ message: 'Нет доступа' })
    return
  }

  await prisma.comment.delete({ where: { id: req.params.commentId } })
  res.status(204).send()
}

import { Router } from 'express'
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  addComment,
  deleteComment,
} from '../controllers/tasks.controller'
import { authenticate } from '../middleware/auth.middleware'

export const tasksRouter = Router()

tasksRouter.use(authenticate)

tasksRouter.get('/projects/:projectId/tasks', getTasks)
tasksRouter.post('/projects/:projectId/tasks', createTask)
tasksRouter.get('/tasks/:id', getTaskById)
tasksRouter.put('/tasks/:id', updateTask)
tasksRouter.patch('/tasks/:id/status', updateTaskStatus)
tasksRouter.delete('/tasks/:id', deleteTask)
tasksRouter.post('/tasks/:id/comments', addComment)
tasksRouter.delete('/tasks/:id/comments/:commentId', deleteComment)

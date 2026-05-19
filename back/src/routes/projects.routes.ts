import { Router } from 'express'
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} from '../controllers/projects.controller'
import { authenticate } from '../middleware/auth.middleware'

export const projectsRouter = Router()

projectsRouter.use(authenticate)

projectsRouter.get('/', getProjects)
projectsRouter.post('/', createProject)
projectsRouter.get('/:id', getProjectById)
projectsRouter.put('/:id', updateProject)
projectsRouter.delete('/:id', deleteProject)
projectsRouter.post('/:id/members', addMember)
projectsRouter.delete('/:id/members/:userId', removeMember)

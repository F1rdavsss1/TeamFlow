import { Router } from 'express'
import { getProfile, updateProfile, getUserById, searchUsers } from '../controllers/users.controller'
import { authenticate } from '../middleware/auth.middleware'

export const usersRouter = Router()

usersRouter.use(authenticate)

usersRouter.get('/profile', getProfile)
usersRouter.put('/profile', updateProfile)
usersRouter.get('/search', searchUsers)
usersRouter.get('/:id', getUserById)

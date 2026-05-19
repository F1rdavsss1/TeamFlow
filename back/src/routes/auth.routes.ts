import { Router } from 'express'
import { register, login, logout, logoutAll, refresh } from '../controllers/auth.controller'
import { authenticate } from '../middleware/auth.middleware'

export const authRouter = Router()

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/logout', logout)
authRouter.post('/logout-all', authenticate, logoutAll)
authRouter.post('/refresh', refresh)

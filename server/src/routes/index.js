import { Router } from 'express'
import adminContentRouter from './admin.content.js'
import adminUsersRouter from './admin.users.js'
import studentRouter from './student.js'
import authRouter from './auth.js'

const router = Router()

router.use('/auth', authRouter)
router.use('/admin', adminContentRouter)
router.use('/admin', adminUsersRouter)
router.use('/student', studentRouter)

// routes à venir : /health, /api/auth, /api/admin, /api/notifications, /api

// error handler à venir

// MongoDB + listen à venir

export default router
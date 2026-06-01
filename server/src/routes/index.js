import { Router } from 'express'
import adminContentRouter from './admin.content.js'
import studentRouter from './student.js'

const router = Router()

router.use('/admin', adminContentRouter)
router.use('/student', studentRouter)

// routes à venir : /health, /api/auth, /api/admin, /api/notifications, /api

// error handler à venir

// MongoDB + listen à venir

export default router
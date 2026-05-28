import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware.js'
import {
    createLesson,
    updateLesson,
    getLesson,
    getLessonsByCourse,
} from '../controllers/lesson.controller.js'

const router = Router()

router.post('/', requireAuth, requireAdmin, createLesson)       // admin: import leçon
router.put('/:id', requireAuth, requireAdmin, updateLesson)     // admin: modifier leçon
router.get('/', requireAuth, getLessonsByCourse)                // étudiant: liste leçons
router.get('/:id', requireAuth, getLesson)                      // étudiant: accès contenu

export default router
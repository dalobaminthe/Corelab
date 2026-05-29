import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import Lesson from '../models/Lesson.js'

const router = Router()

// GET - liste leçons disponibles
router.get('/lessons', requireAuth, async (req, res) => {
    try {
        const { courseId } = req.query
        const lessons = await Lesson.find({
            courseId,
            availableFrom: {
                $lte: Date.now() }
        })
        res.json(lessons)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// GET /api/student/lessons/:id - accéder au contenu d'une leçon
router.get('/lessons/:id', requireAuth, async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id)
        if (!lesson) return res.status(404).json({ 
            error: 'Lesson not found' 
        })
        if (lesson.availableFrom > Date.now()) {
            return res.status(403).json({ error: 'Lesson not available yet' })
        }
        res.json(lesson)
    } catch (err) {
    res.status(400).json({ 
        error: err.message
    })}
})

export default router
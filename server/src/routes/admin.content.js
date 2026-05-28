import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware.js'
import Lesson from '../models/Lesson.js'

const router = Router()

// POST - import leçon HTML
router.post('/lessons', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { title, content, courseId, availableFrom } = req.body
        const lesson = await Lesson.create({ title, content, courseId, availableFrom })
        res.status(201).json(lesson)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// PUT - modifier une leçon existante
router.put('/lessons/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const lesson = await Lesson.findByIdAndUpdate(req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true })
        if (!lesson) return res.status(404).json({ error: 'Lesson not found' })
        res.json(lesson)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// PATCH - planifier date de mise à dispo
router.patch('/lessons/:id/schedule', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { availableFrom } = req.body
        const lesson = await Lesson.findByIdAndUpdate(req.params.id,
            { availableFrom, updatedAt: Date.now() },
            { new: true })
        if (!lesson) 
            return res.status(404).json({ error: 'Lesson not found' })
        res.json(lesson)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

export default router
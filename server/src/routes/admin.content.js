import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import Lesson from '../models/Lesson.js'
import Quiz from '../models/Quiz.js'
import { validate, importQuizSchema } from '../middleware/validate.js'

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

// POST - import QCM depuis JSON
router.post('/quizzes/import', requireAuth, requireAdmin, validate(importQuizSchema), async (req, res) => {
  try {
    // vérifie que correctIndexes sont valides pour chaque question
    for (const q of req.body.questions) {
      for (const idx of q.correctIndexes) {
        if (idx < 0 || idx >= q.choices.length) {
          return res.status(400).json({
            error: `Index ${idx} invalide pour la question "${q.prompt}"`
          })
        }
      }
    }
    const quiz = await Quiz.create(req.body)
    res.status(201).json(quiz)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// PATCH - modifier le seuil de réussite
router.patch('/quizzes/:id/passing-score', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { passingScore } = req.body
    if (passingScore === undefined || passingScore < 0 || passingScore > 100) {
      return res.status(400).json({ error: 'passingScore doit être entre 0 et 100' })
    }
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { passingScore },
      { new: true }
    )
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' })
    res.json(quiz)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

export default router
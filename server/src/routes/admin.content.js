import { Router } from 'express'
import { verifyToken, requireAdmin } from '../middleware/auth.js'
import Lesson from '../models/Lesson.js'
import Quiz from '../models/Quiz.js'
import { validate, importQuizSchema, importLessonSchema } from '../middleware/validate.js'
import { parse } from 'csv-parse/sync'

const router = Router()

// POST - import leçon HTML
router.post('/lessons', verifyToken, requireAdmin, validate(importLessonSchema), async (req, res) => {
      try {
        const { title, content, courseId, availableFrom } = req.body
        const lesson = await Lesson.create({ title, content, courseId, availableFrom })
        res.status(201).json(lesson)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// PUT - modifier une leçon existante
router.put('/lessons/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        const lesson = await Lesson.findByIdAndUpdate(req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { returnDocument: 'after' })
        if (!lesson) return res.status(404).json({ error: 'Lesson not found' })
        res.json(lesson)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// PATCH - planifier date de mise à dispo
router.patch('/lessons/:id/schedule', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { availableFrom } = req.body
        const lesson = await Lesson.findByIdAndUpdate(req.params.id,
            { availableFrom, updatedAt: Date.now() },
            { returnDocument: 'after' })
        if (!lesson) 
            return res.status(404).json({ error: 'Lesson not found' })
        res.json(lesson)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// POST - import QCM depuis JSON ou CSV
router.post('/quizzes/import', verifyToken, requireAdmin, async (req, res) => {
  try {
    const contentType = req.headers['content-type'] || ''
    let quizData

    if (contentType.includes('text/csv')) {
      // parsing CSV
      const csvText = req.body
      const records = parse(csvText, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      })

      // on reconstruit le format attendu
      quizData = {
        title: req.query.title || 'Quiz importé',
        lesson: req.query.lesson,
        passingScore: Number(req.query.passingScore) || 50,
        questions: records.map(row => ({
          prompt: row.prompt,
          choices: row.choices.split('|'),
          correctIndexes: row.correctIndexes.split(',').map(Number),
        })),
      }
    } else {
      // JSON — comportement existant
      quizData = req.body
    }

    // validation Zod sur les deux formats
    const parsed = importQuizSchema.safeParse(quizData)
    if (!parsed.success) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: parsed.error.errors 
      })
    }

    // vérifie que correctIndexes sont valides
    for (const q of parsed.data.questions) {
      for (const idx of q.correctIndexes) {
        if (idx < 0 || idx >= q.choices.length) {
          return res.status(400).json({
            error: `Index ${idx} invalide pour la question "${q.prompt}"`
          })
        }
      }
    }

    const quiz = await Quiz.create(parsed.data)
    res.status(201).json(quiz)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// PATCH - modifier le seuil de réussite
router.patch('/quizzes/:id/passing-score', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { passingScore } = req.body
    if (passingScore === undefined || passingScore < 0 || passingScore > 100) {
      return res.status(400).json({ error: 'passingScore doit être entre 0 et 100' })
    }
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { passingScore },
      { returnDocument: 'after' }
    )
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' })
    res.json(quiz)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

export default router
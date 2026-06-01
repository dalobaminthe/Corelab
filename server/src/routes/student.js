import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import Lesson from '../models/Lesson.js'
import Quiz from '../models/Quiz.js'
import Attempt from '../models/Attempt.js'
import { validate, submitAttemptSchema } from '../middleware/validate.js'

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

// GET - récupérer un quiz sans les réponses
router.get('/quizzes/:id', requireAuth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).select('-questions.correctIndexes')
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' })
    res.json(quiz)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// POST - soumettre ses réponses
router.post('/quizzes/submit', requireAuth, validate(submitAttemptSchema), async (req, res) => {
  try {
    const { quizId, answers } = req.body

    const quiz = await Quiz.findById(quizId)
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' })

    if (answers.length !== quiz.questions.length) {
      return res.status(400).json({ error: 'Nombre de réponses incorrect' })
    }

    // calcul du score
    let correct = 0
    const results = quiz.questions.map((q, i) => {
      const isCorrect = q.correctIndexes.includes(answers[i])
      if (isCorrect) correct++
      return {
        questionIndex: i,
        correct: isCorrect,
        correctIndexes: q.correctIndexes,
      }
    })

    const score = Math.round((correct / quiz.questions.length) * 100)
    const passed = score >= quiz.passingScore

    // sauvegarde de la tentative
    const attempt = await Attempt.create({
      student: req.user.userId,
      quiz: quizId,
      answers,
      score,
      passed,
    })

    res.status(201).json({ score, passed, passingScore: quiz.passingScore, results, attempt })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

export default router
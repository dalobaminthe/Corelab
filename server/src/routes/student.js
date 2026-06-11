import { Router } from 'express'
import { verifyToken } from '../middleware/auth.js'
import Lesson from '../models/Lesson.js'
import Quiz from '../models/Quiz.js'
import Attempt from '../models/Attempt.js'
import Notification from '../models/Notification.js'
import { validate, submitAttemptSchema } from '../middleware/validate.js'
import mongoose from 'mongoose'

const router = Router()

// GET - liste leçons disponibles
router.get('/lessons', verifyToken, async (req, res) => {
  try {
    const { courseId } = req.query
    const lessons = await Lesson.find({
      courseId,
      availableFrom: { $lte: Date.now() }
    })
    res.json(lessons)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// GET /api/student/lessons/:id/quiz - récupérer le quiz d'une leçon (sans les réponses)
router.get('/lessons/:id/quiz', verifyToken, async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ lesson: req.params.id })
      .select('-questions.correctIndexes')
    if (!quiz) return res.status(404).json({ error: 'No quiz for this lesson' })
    res.json(quiz)
  } catch (err) {
    next(err)
  }
})

// GET /api/student/lessons/:id - accéder au contenu d'une leçon
router.get('/lessons/:id', verifyToken, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' })
    if (lesson.availableFrom > Date.now()) {
      return res.status(403).json({ error: 'Lesson not available yet' })
    }
    res.json(lesson)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// GET - récupérer un quiz sans les réponses
router.get('/quizzes/:id', verifyToken, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).select('-questions.correctIndexes')
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' })
    res.json(quiz)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// POST - soumettre ses réponses
router.post('/quizzes/submit', verifyToken, validate(submitAttemptSchema), async (req, res) => {
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

// ─── GET /api/student/progress/:courseId ─────────────────────────────────────
// Retourne la progression d'un étudiant dans un cours.
// Calcule combien de leçons ont été validées (quiz passé avec passed: true).
router.get('/progress/:courseId', verifyToken, async (req, res, next) => {
  try {
    const studentId = new mongoose.Types.ObjectId(req.user.userId)
    const courseId = new mongoose.Types.ObjectId(req.params.courseId)

    const lessons = await Lesson.find({ courseId })
    const totalLessons = lessons.length

    if (totalLessons === 0) {
      return res.json({ courseId: req.params.courseId, totalLessons: 0, completedLessons: 0, progressPercent: 0 })
    }

    const lessonIds = lessons.map(l => l._id)
    const quizzes = await Quiz.find({ lesson: { $in: lessonIds } }).select('_id lesson')
    const quizIds = quizzes.map(q => q._id)

    const passedQuizzes = await Attempt.aggregate([
      { $match: { student: studentId, quiz: { $in: quizIds }, passed: true } },
      { $group: { _id: '$quiz' } },
    ])

    const completedLessons = passedQuizzes.length
    const progressPercent = Math.round((completedLessons / totalLessons) * 100)

    res.json({ courseId: req.params.courseId, totalLessons, completedLessons, progressPercent })
  } catch (err) {
    next(err)
  }
})

// ─── GET /api/student/notifications ──────────────────────────────────────────
// Retourne toutes les notifications de l'étudiant connecté, les non-lues en premier.
router.get('/notifications', verifyToken, async (req, res, next) => {
  try {
    const notifications = await Notification.find({ student: req.user.userId })
      .populate('lesson', 'title')
      .sort({ read: 1, sentAt: -1 })
    res.json(notifications)
  } catch (err) {
    next(err)
  }
})

// ─── PATCH /api/student/notifications/:id/read ────────────────────────────────
// Marque une notification comme lue.
router.patch('/notifications/:id/read', verifyToken, async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, student: req.user.userId },
      { read: true },
      { new: true }
    )
    if (!notification) return res.status(404).json({ error: 'Notification not found' })
    res.json(notification)
  } catch (err) {
    next(err)
  }
})

export default router
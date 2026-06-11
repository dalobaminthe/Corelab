import { Router } from 'express'
import bcrypt from 'bcrypt'
import User from '../models/User.js'
import Course from '../models/Course.js'
import Attempt from '../models/Attempt.js'
import { verifyToken, requireAdmin } from '../middleware/auth.js'
import { validate, assignCoursesSchema, createCourseSchema } from '../middleware/validate.js'

const router = Router()

const BCRYPT_ROUNDS = 10

// ─── POST /api/admin/users/import ───────────────────────────────────────────
router.post('/users/import', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const users = req.body // on req un tableau

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ error: 'Expected a non-empty array of users' })
    }

    const TEMP_PASSWORD = await bcrypt.hash('passwordpending', BCRYPT_ROUNDS) // en attendant

    const results = { created: [], skipped: [] } // pour les utilisateurs créés et ceux ignorés (ignoré si déjà existant ou données manquantes)

    for (const { name, email, role } of users) { // on itère sur chaque utilisateur
      if (!name || !email) {
        results.skipped.push({ email, reason: 'Missing name or email' }) // donc missing name or email
        continue
      }

      const exists = await User.findOne({ email: email.toLowerCase() })
      if (exists) {
        results.skipped.push({ email, reason: 'Already exists' }) // ou préexistant
        continue
      }

      const user = await User.create({ // on crée l'utilisateur avec ces champs
        name,
        email,
        passwordHash: TEMP_PASSWORD,
        role: role === 'admin' ? 'admin' : 'student',
        isFirstLogin: true,
      })

      results.created.push(user)
    }

    res.status(201).json(results)
  } catch (err) {
    next(err)
  }
})

// ─── GET /api/admin/users ────────────────────────────────────────────────────
// Récupère tous les utilisateurs avec leurs cours associés (titre seulement)
router.get('/users', verifyToken, requireAdmin, async (req, res, next) => { 
  try {
    const users = await User.find().populate('courses', 'title')
    res.json(users)
  } catch (err) {
    next(err)
  }
})

// ─── GET /api/admin/users/:id ────────────────────────────────────────────────
// Récupère un utilisateur par ID avec ses cours associés (titre seulement)
router.get('/users/:id', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('courses', 'title')
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  } catch (err) {
    next(err)
  }
})

// ─── PUT /api/admin/users/:id/courses ────────────────────────────────────────
// Assigne des cours à un utilisateur (étudiant) en mettant à jour les références dans User et Course
router.put('/users/:id/courses', verifyToken, requireAdmin, validate(assignCoursesSchema), async (req, res, next) => {
  try {
    const { courseIds } = req.body

    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ error: 'User not found' })

    // Vérifie que tous les courseIds existent en base
    const existingCourses = await Course.find({ _id: { $in: courseIds } })
    if (existingCourses.length !== courseIds.length) {
      return res.status(400).json({ error: 'One or more courseIds are invalid' })
    }

    // Retire l'étudiant des anciens cours
    await Course.updateMany(
      { _id: { $in: user.courses } },
      { $pull: { students: user._id } }
    )

    // Ajoute l'étudiant aux nouveaux cours
    await Course.updateMany(
      { _id: { $in: courseIds } },
      { $addToSet: { students: user._id } }
    )

    // Met à jour le user
    user.courses = courseIds
    await user.save()

    res.json(await user.populate('courses', 'title'))
  } catch (err) {
    next(err)
  }
})

// ─── POST /api/admin/courses ──────────────────────────────────────────────────
// Crée un nouveau cours, le createdBy est automatiquement l'admin connecté
router.post('/courses', verifyToken, requireAdmin, validate(createCourseSchema), async (req, res, next) => {
  try {
    const { title, description } = req.body
    const course = await Course.create({ title, description, createdBy: req.user.userId })
    res.status(201).json(course)
  } catch (err) {
    next(err)
  }
})

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────
// Statistiques globales de la plateforme pour le dashboard admin
router.get('/stats', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const [totalStudents, totalCourses, attempts] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Course.countDocuments(),
      Attempt.find(),
    ])
    const totalAttempts = attempts.length
    const successRate = totalAttempts === 0
      ? 0
      : Math.round((attempts.filter(a => a.passed).length / totalAttempts) * 100)
    res.json({ totalStudents, totalCourses, totalAttempts, successRate })
  } catch (err) {
    next(err)
  }
})

// ─── GET /api/admin/courses ───────────────────────────────────────────────────
// Liste des cours avec leurs étudiants
router.get('/courses', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const courses = await Course.find().populate('students', 'name email')
    res.json(courses)
  } catch (err) {
    next(err)
  }
})

// ─── GET /api/admin/activity ──────────────────────────────────────────────────
// 20 dernières tentatives avec étudiant et quiz peuplés
router.get('/activity', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const activity = await Attempt.find()
      .sort({ attemptedAt: -1 })
      .limit(20)
      .populate('student', 'name')
      .populate({ path: 'quiz', select: 'title', populate: { path: 'lesson', select: 'title' } })
    res.json(activity)
  } catch (err) {
    next(err)
  }
})

export default router
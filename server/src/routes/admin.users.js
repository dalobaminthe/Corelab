import { Router } from 'express'
import bcrypt from 'bcrypt'
import User from '../models/User.js'
import Course from '../models/Course.js'
import { verifyToken, requireAdmin } from '../middleware/auth.js'
import { validate, assignCoursesSchema } from '../middleware/validate.js'

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

export default router

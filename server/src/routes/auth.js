import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { verifyToken } from '../middleware/auth.js'
import { validate, loginSchema, setPasswordSchema } from '../middleware/validate.js'

const router = Router()

const BCRYPT_ROUNDS = 10
const JWT_EXPIRES_IN = '24h'

const signToken = (user) =>
  jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )

// ─── POST /api/auth/login ────────────────────────────────────────────────────
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email }) // erreur si pas email trouvé
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.passwordHash) // erreur si mdp incorrect
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

    const token = signToken(user) // génère un JWT avec userId et role

    res.json({ token, user, isFirstLogin: user.isFirstLogin }) // si isFirstLogin true, le front redirige vers page de choix de mot de passe
  } catch (err) {
    next(err)
  }
})

// ─── POST /api/auth/set-password ─────────────────────────────────────────────
// Route du set password pour première connexion
router.post("/set-password", verifyToken, validate(setPasswordSchema), async (req, res, next) => {
  try {
    const { newPassword } = req.body // récupère le nouveau mot de passe du body

    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS) // on hash

    const user = await User.findByIdAndUpdate( // on update le user avec nouveau mdp hashé et isFirstLogin à false
      req.user.userId,
      { passwordHash: hashedPassword, isFirstLogin: false },
      { new: true }
    )

    if (!user) return res.status(404).json({ error: 'User not found' })

    // Nouveau token avc isFirstLogin à false en front
    const token = signToken(user)

    res.json({ token, user })
  } catch (err) {
    next(err)
  }
})

// ─── GET /api/auth/me ────────────────────────────────────────────────────────
// Route protégée pour récupérer les infos du user connecté via JWT
// On fait ça psk utile au front d'avoir les infos du user après login ou set-password, et aussi pour vérifier que le token est valide
router.get("/me", verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  } catch (err) {
    next(err)
  }
})

export default router
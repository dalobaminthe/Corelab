import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
dotenv.config()

import User from '../src/models/User.js'
import Course from '../src/models/Course.js'
import Lesson from '../src/models/Lesson.js'
import Quiz from '../src/models/Quiz.js'
import Attempt from '../src/models/Attempt.js'
import Notification from '../src/models/Notification.js'

const BCRYPT_ROUNDS = 10

// ─── Seed minimal pour la démo live ──────────────────────────────────────────
// Crée UNIQUEMENT un compte admin.
// Tout le reste (import étudiants, cours, leçons, quiz) se fait en direct
// via le front pendant la soutenance pour démontrer le flow complet.

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('MongoDB connected')

  // Nettoyage complet
  await Promise.all([
    User.deleteMany(),
    Course.deleteMany(),
    Lesson.deleteMany(),
    Quiz.deleteMany(),
    Attempt.deleteMany(),
    Notification.deleteMany(),
  ])
  console.log('Collections nettoyées')

  // Un seul admin
  const adminHash = await bcrypt.hash('Admin1234!', BCRYPT_ROUNDS)
  await User.create({
    name: 'Alice Admin',
    email: 'admin@corelab.dev',
    passwordHash: adminHash,
    role: 'admin',
    isFirstLogin: false,
  })

  console.log('\n✅ Seed minimal terminé !')
  console.log('  admin@corelab.dev → Admin1234!')
  console.log('\n  Le reste se crée via le front pendant la démo.')

  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  mongoose.disconnect()
  process.exit(1)
})

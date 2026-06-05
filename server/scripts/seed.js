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

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('MongoDB connected')

  // Nettoyage
  await Promise.all([
    User.deleteMany(),
    Course.deleteMany(),
    Lesson.deleteMany(),
    Quiz.deleteMany(),
    Attempt.deleteMany(),
    Notification.deleteMany(),
  ])
  console.log('Collections nettoyées')

  // ─── Users ────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin1234!', BCRYPT_ROUNDS)
  const studentHash = await bcrypt.hash('Student1234!', BCRYPT_ROUNDS)

  const admin = await User.create({
    name: 'Alice Admin',
    email: 'admin@corelab.dev',
    passwordHash: adminHash,
    role: 'admin',
    isFirstLogin: false,
  })

  const [student1, student2] = await User.insertMany([
    {
      name: 'Bob Étudiant',
      email: 'bob@corelab.dev',
      passwordHash: studentHash,
      role: 'student',
      isFirstLogin: false,
    },
    {
      name: 'Clara Étudiante',
      email: 'clara@corelab.dev',
      passwordHash: studentHash,
      role: 'student',
      isFirstLogin: true, // première connexion pas encore faite
    },
  ])
  console.log('Users créés')

  // ─── Courses ──────────────────────────────────────────────────────────────
  const [course1, course2] = await Course.insertMany([
    {
      title: 'Introduction au JavaScript',
      description: 'Les bases du JS pour débutants.',
      createdBy: admin._id,
      students: [student1._id],
    },
    {
      title: 'Node.js & Express',
      description: 'Construire des APIs REST avec Node.js.',
      createdBy: admin._id,
      students: [student1._id, student2._id],
    },
  ])

  // Mise à jour des cours dans les users
  await User.findByIdAndUpdate(student1._id, { courses: [course1._id, course2._id] })
  await User.findByIdAndUpdate(student2._id, { courses: [course2._id] })
  console.log('Courses créés')

  // ─── Lessons ──────────────────────────────────────────────────────────────
  const [lesson1, lesson2, lesson3] = await Lesson.insertMany([
    {
      title: 'Variables et types',
      content: '<h1>Variables</h1><p>En JS, on utilise <code>let</code>, <code>const</code> et <code>var</code>.</p>',
      courseId: course1._id,
      availableFrom: new Date(Date.now() - 1000 * 60 * 60 * 24), // hier
    },
    {
      title: 'Fonctions et callbacks',
      content: '<h1>Fonctions</h1><p>Les fonctions sont des citoyens de première classe en JS.</p>',
      courseId: course1._id,
      availableFrom: new Date(Date.now() + 1000 * 60 * 60 * 24), // demain (pas encore dispo)
    },
    {
      title: 'Introduction à Express',
      content: '<h1>Express</h1><p>Express est un framework minimaliste pour Node.js.</p>',
      courseId: course2._id,
      availableFrom: new Date(Date.now() - 1000 * 60 * 60 * 48), // avant-hier
    },
  ])

  // Mise à jour des leçons dans les cours
  await Course.findByIdAndUpdate(course1._id, { lessons: [lesson1._id, lesson2._id] })
  await Course.findByIdAndUpdate(course2._id, { lessons: [lesson3._id] })
  console.log('Lessons créées')

  // ─── Quizzes ──────────────────────────────────────────────────────────────
  const [quiz1, quiz2] = await Quiz.insertMany([
    {
      title: 'Quiz - Variables JS',
      lesson: lesson1._id,
      passingScore: 60,
      questions: [
        {
          prompt: 'Quel mot-clé permet de déclarer une variable non réassignable ?',
          choices: ['var', 'let', 'const', 'static'],
          correctIndexes: [2],
        },
        {
          prompt: 'Quel est le type de `typeof null` en JS ?',
          choices: ['null', 'undefined', 'object', 'string'],
          correctIndexes: [2],
        },
        {
          prompt: 'Laquelle de ces déclarations est valide ?',
          choices: ['const x;', 'let x = 5;', 'var;', 'const = 5;'],
          correctIndexes: [1],
        },
      ],
    },
    {
      title: 'Quiz - Express Basics',
      lesson: lesson3._id,
      passingScore: 50,
      questions: [
        {
          prompt: 'Quel est le port conventionnel pour une API Express en dev ?',
          choices: ['3000', '8080', '4242', 'Les deux premiers'],
          correctIndexes: [0, 1, 2, 3],
        },
        {
          prompt: 'Quelle méthode HTTP est utilisée pour créer une ressource ?',
          choices: ['GET', 'POST', 'PUT', 'DELETE'],
          correctIndexes: [1],
        },
      ],
    },
  ])
  console.log('Quizzes créés')

  // ─── Attempts ─────────────────────────────────────────────────────────────
  await Attempt.insertMany([
    {
      student: student1._id,
      quiz: quiz1._id,
      answers: [2, 2, 1], // toutes correctes → 100%
      score: 100,
      passed: true,
    },
    {
      student: student1._id,
      quiz: quiz2._id,
      answers: [0, 0], // Q1 correcte (index 0 fait partie des correctIndexes), Q2 incorrecte → 50%
      score: 50,
      passed: true,
    },
  ])
  console.log('Attempts créés')

  // ─── Notifications ────────────────────────────────────────────────────────
  await Notification.insertMany([
    {
      student: student1._id,
      lesson: lesson1._id,
      message: 'La leçon "Variables et types" est maintenant disponible.',
      read: true,
      type: 'lesson',
    },
    {
      student: student2._id,
      lesson: lesson3._id,
      message: 'La leçon "Introduction à Express" est maintenant disponible.',
      read: false,
      type: 'lesson',
    },
  ])
  console.log('Notifications créées')

  console.log('\n✅ Seed terminé !')
  console.log('  admin@corelab.dev     → Admin1234!')
  console.log('  bob@corelab.dev       → Student1234!')
  console.log('  clara@corelab.dev     → Student1234! (isFirstLogin: true)')

  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  mongoose.disconnect()
  process.exit(1)
})
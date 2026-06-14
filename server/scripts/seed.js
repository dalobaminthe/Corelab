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

  const [bob, clara, david, emma] = await User.insertMany([
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
    {
      name: 'David Martin',
      email: 'david@corelab.dev',
      passwordHash: studentHash,
      role: 'student',
      isFirstLogin: false,
    },
    {
      name: 'Emma Petit',
      email: 'emma@corelab.dev',
      passwordHash: studentHash,
      role: 'student',
      isFirstLogin: false,
    },
  ])
  console.log('Users créés')

  // ─── Courses ──────────────────────────────────────────────────────────────
  const [courseHistoire, courseStylisme, courseTextile] = await Course.insertMany([
    {
      title: 'Histoire de la Mode Contemporaine',
      description: 'Découvrez l\'évolution des silhouettes et les grands créateurs du XXe siècle.',
      createdBy: admin._id,
      students: [bob._id, david._id],
    },
    {
      title: 'Stylisme & Création',
      description: 'Apprenez à développer une collection, du moodboard au croquis de mode.',
      createdBy: admin._id,
      students: [bob._id, clara._id, david._id],
    },
    {
      title: 'Textile & Matières',
      description: 'Comprendre les fibres naturelles et synthétiques, et les enjeux éco-responsables.',
      createdBy: admin._id,
      students: [emma._id],
    },
  ])

  // Mise à jour des cours dans les users
  await User.findByIdAndUpdate(bob._id, { courses: [courseHistoire._id, courseStylisme._id] })
  await User.findByIdAndUpdate(clara._id, { courses: [courseStylisme._id] })
  await User.findByIdAndUpdate(david._id, { courses: [courseHistoire._id, courseStylisme._id] })
  await User.findByIdAndUpdate(emma._id, { courses: [courseTextile._id] })
  console.log('Courses créés')

  // ─── Lessons ──────────────────────────────────────────────────────────────
  const day = 1000 * 60 * 60 * 24
  const [lessonAnnées20, lessonDior, lessonCroquis, lessonMoodboard, lessonFibres] = await Lesson.insertMany([
    {
      title: 'Les années 20 : La libération',
      content: '<h1>Les Années 20</h1><p>Les silhouettes se raccourcissent, le corset disparaît.</p><p>C\'est l\'ère des <strong>garçonnes</strong> et de la libération du corps de la femme, menée par des créatrices comme Coco Chanel et Madeleine Vionnet.</p>',
      courseId: courseHistoire._id,
      availableFrom: new Date(Date.now() - day * 7), // disponible depuis 7 jours
    },
    {
      title: 'L\'après-guerre : Le New Look',
      content: '<h1>Le New Look</h1><p>Créé par <strong>Christian Dior</strong> en 1947, en réaction aux années de privation.</p><p>Il se caractérise par une taille très marquée, des épaules douces et des jupes corolles très amples.</p>',
      courseId: courseHistoire._id,
      availableFrom: new Date(Date.now() + day * 2), // pas encore dispo (dans 2 jours)
    },
    {
      title: 'Les bases du croquis de mode',
      content: '<h1>Le Croquis</h1><p>La figurine de mode standard est allongée et mesure généralement <strong>9 têtes</strong>.</p><p>Elle sert de base pour exprimer l\'attitude et le tombé du vêtement.</p>',
      courseId: courseStylisme._id,
      availableFrom: new Date(Date.now() - day * 5),
    },
    {
      title: 'Créer un moodboard',
      content: '<h1>Le Moodboard</h1><p>Aussi appelé planche de tendance, il rassemble images, textures, couleurs et mots-clés.</p><p>Il sert de fil conducteur visuel pour toute la collection.</p>',
      courseId: courseStylisme._id,
      availableFrom: new Date(Date.now() - day * 2),
    },
    {
      title: 'Les fibres naturelles vs synthétiques',
      content: '<h1>Les Fibres</h1><p>Les fibres naturelles (coton, lin, soie, laine) proviennent de sources végétales ou animales.</p><p>Les fibres synthétiques (polyester, nylon) sont issues de la pétrochimie.</p>',
      courseId: courseTextile._id,
      availableFrom: new Date(Date.now() - day * 3),
    },
  ])

  // Mise à jour des leçons dans les cours
  await Course.findByIdAndUpdate(courseHistoire._id, { lessons: [lessonAnnées20._id, lessonDior._id] })
  await Course.findByIdAndUpdate(courseStylisme._id, { lessons: [lessonCroquis._id, lessonMoodboard._id] })
  await Course.findByIdAndUpdate(courseTextile._id, { lessons: [lessonFibres._id] })
  console.log('Lessons créées')

  // ─── Quizzes ──────────────────────────────────────────────────────────────
  const [quizHistoire, quizStylisme, quizTextile] = await Quiz.insertMany([
    {
      title: 'Quiz - Les Années 20',
      lesson: lessonAnnées20._id,
      passingScore: 60,
      questions: [
        {
          prompt: 'Quelle créatrice est souvent associée à la silhouette des "garçonnes" ?',
          choices: ['Jeanne Lanvin', 'Elsa Schiaparelli', 'Coco Chanel', 'Christian Dior'],
          correctIndexes: [2],
        },
        {
          prompt: 'Quel sous-vêtement féminin contraignant disparaît massivement dans les années 20 ?',
          choices: ['Le jupon', 'Le corset', 'La crinoline', 'Le soutien-gorge'],
          correctIndexes: [1],
        },
        {
          prompt: 'Comment s\'appelle la fameuse petite robe noire inventée en 1926 ?',
          choices: ['La robe Ford', 'La robe Cocktail', 'La robe New Look', 'La robe de Bal'],
          correctIndexes: [0], // Optionnel: un petit challenge historique
        },
      ],
    },
    {
      title: 'Quiz - Croquis de mode',
      lesson: lessonCroquis._id,
      passingScore: 50,
      questions: [
        {
          prompt: 'Combien de "têtes" mesure généralement une figurine de mode standard pour allonger la silhouette ?',
          choices: ['6 têtes', '9 têtes', '12 têtes', '7.5 têtes'],
          correctIndexes: [1],
        },
        {
          prompt: 'Quel est l\'objectif principal du croquis de mode ?',
          choices: ['Faire un portrait réaliste', 'Montrer l\'attitude et le vêtement', 'Créer un patron technique', 'Décorer un atelier'],
          correctIndexes: [1],
        },
        {
          prompt: 'Quels éléments retrouve-t-on souvent sur un croquis abouti ? (plusieurs choix)',
          choices: ['Les ombres et lumières', 'Des échantillons de tissu', 'Le tombé du vêtement', 'Le prix de vente'],
          correctIndexes: [0, 1, 2],
        },
      ],
    },
    {
      title: 'Quiz - Fibres Textiles',
      lesson: lessonFibres._id,
      passingScore: 70,
      questions: [
        {
          prompt: 'Parmi ces fibres, laquelle est d\'origine animale ?',
          choices: ['Le coton', 'La soie', 'Le lin', 'Le polyester'],
          correctIndexes: [1],
        },
        {
          prompt: 'Quelle fibre est issue de la pétrochimie ?',
          choices: ['Polyester', 'Laine', 'Chanvre', 'Viscose'],
          correctIndexes: [0],
        },
      ],
    },
  ])
  console.log('Quizzes créés')

  // ─── Attempts ─────────────────────────────────────────────────────────────
  // Bob : a réussi le quiz Histoire (100%) et le quiz Stylisme (réussi de justesse)
  // David : a échoué le quiz Histoire puis l'a repassé avec succès
  await Attempt.insertMany([
    {
      student: bob._id,
      quiz: quizHistoire._id,
      answers: [2, 1, 0], // toutes correctes → 100%
      score: 100,
      passed: true,
      attemptedAt: new Date(Date.now() - day * 4),
    },
    {
      student: bob._id,
      quiz: quizStylisme._id,
      answers: [1, 1, 2], // Q3 incomplète → 2/3 ≈ 67%
      score: 67,
      passed: true,
      attemptedAt: new Date(Date.now() - day * 1),
    },
    {
      student: david._id,
      quiz: quizHistoire._id,
      answers: [0, 0, 3], // tout faux → 0%
      score: 0,
      passed: false,
      attemptedAt: new Date(Date.now() - day * 3),
    },
    {
      student: david._id,
      quiz: quizHistoire._id,
      answers: [2, 1, 0], // rattrapage réussi → 100%
      score: 100,
      passed: true,
      attemptedAt: new Date(Date.now() - day * 2),
    },
  ])
  console.log('Attempts créés')

  // ─── Notifications ────────────────────────────────────────────────────────
  await Notification.insertMany([
    {
      student: bob._id,
      lesson: lessonAnnées20._id,
      message: 'La leçon "Les années 20 : La libération" est maintenant disponible.',
      read: true,
      type: 'lesson',
    },
    {
      student: bob._id,
      lesson: lessonMoodboard._id,
      message: 'La leçon "Créer un moodboard" est maintenant disponible.',
      read: false,
      type: 'lesson',
    },
    {
      student: clara._id,
      lesson: lessonCroquis._id,
      message: 'La leçon "Les bases du croquis de mode" est maintenant disponible.',
      read: false,
      type: 'lesson',
    },
    {
      student: david._id,
      lesson: lessonMoodboard._id,
      message: 'La leçon "Créer un moodboard" est maintenant disponible.',
      read: false,
      type: 'lesson',
    },
  ])
  console.log('Notifications créées')

  console.log('\n✅ Seed terminé !')
  console.log('  admin@corelab.dev     → Admin1234!')
  console.log('  bob@corelab.dev       → Student1234! (2 cours, progression avancée)')
  console.log('  clara@corelab.dev     → Student1234! (isFirstLogin: true)')
  console.log('  david@corelab.dev     → Student1234! (a échoué puis rattrapé un quiz)')
  console.log('  emma@corelab.dev      → Student1234! (cours Textile)')

  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  mongoose.disconnect()
  process.exit(1)
})
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
  const [courseJS, courseNode, courseReact] = await Course.insertMany([
    {
      title: 'Introduction au JavaScript',
      description: 'Les bases du JS pour débutants : variables, fonctions, objets.',
      createdBy: admin._id,
      students: [bob._id, david._id],
    },
    {
      title: 'Node.js & Express',
      description: 'Construire des APIs REST avec Node.js et Express.',
      createdBy: admin._id,
      students: [bob._id, clara._id, david._id],
    },
    {
      title: 'React pour le front-end',
      description: 'Composants, hooks et gestion d\'état avec React.',
      createdBy: admin._id,
      students: [emma._id],
    },
  ])

  // Mise à jour des cours dans les users
  await User.findByIdAndUpdate(bob._id, { courses: [courseJS._id, courseNode._id] })
  await User.findByIdAndUpdate(clara._id, { courses: [courseNode._id] })
  await User.findByIdAndUpdate(david._id, { courses: [courseJS._id, courseNode._id] })
  await User.findByIdAndUpdate(emma._id, { courses: [courseReact._id] })
  console.log('Courses créés')

  // ─── Lessons ──────────────────────────────────────────────────────────────
  const day = 1000 * 60 * 60 * 24
  const [lessonVar, lessonFunc, lessonExpress, lessonRoutes, lessonReactIntro] = await Lesson.insertMany([
    {
      title: 'Variables et types',
      content: '<h1>Variables</h1><p>En JS, on utilise <code>let</code>, <code>const</code> et <code>var</code>.</p><p>On privilégie <strong>const</strong> par défaut, et <strong>let</strong> quand la valeur change.</p>',
      courseId: courseJS._id,
      availableFrom: new Date(Date.now() - day * 7), // disponible depuis 7 jours
    },
    {
      title: 'Fonctions et callbacks',
      content: '<h1>Fonctions</h1><p>Les fonctions sont des citoyens de première classe en JS.</p><p>Une callback est une fonction passée en argument à une autre fonction.</p>',
      courseId: courseJS._id,
      availableFrom: new Date(Date.now() + day * 2), // pas encore dispo (dans 2 jours)
    },
    {
      title: 'Introduction à Express',
      content: '<h1>Express</h1><p>Express est un framework minimaliste pour Node.js.</p><p>Il simplifie la création de serveurs HTTP et la gestion des routes.</p>',
      courseId: courseNode._id,
      availableFrom: new Date(Date.now() - day * 5),
    },
    {
      title: 'Routes et middlewares',
      content: '<h1>Routes</h1><p>Une route associe une méthode HTTP et un chemin à une fonction.</p><p>Les middlewares s\'exécutent avant les handlers de route.</p>',
      courseId: courseNode._id,
      availableFrom: new Date(Date.now() - day * 2),
    },
    {
      title: 'Premiers pas avec React',
      content: '<h1>React</h1><p>React permet de construire des interfaces à base de composants réutilisables.</p><p>Un composant retourne du JSX.</p>',
      courseId: courseReact._id,
      availableFrom: new Date(Date.now() - day * 3),
    },
  ])

  // Mise à jour des leçons dans les cours
  await Course.findByIdAndUpdate(courseJS._id, { lessons: [lessonVar._id, lessonFunc._id] })
  await Course.findByIdAndUpdate(courseNode._id, { lessons: [lessonExpress._id, lessonRoutes._id] })
  await Course.findByIdAndUpdate(courseReact._id, { lessons: [lessonReactIntro._id] })
  console.log('Lessons créées')

  // ─── Quizzes ──────────────────────────────────────────────────────────────
  const [quizVar, quizExpress, quizReact] = await Quiz.insertMany([
    {
      title: 'Quiz - Variables JS',
      lesson: lessonVar._id,
      passingScore: 60,
      questions: [
        {
          prompt: 'Quel mot-clé permet de déclarer une variable non réassignable ?',
          choices: ['var', 'let', 'const', 'static'],
          correctIndexes: [2],
        },
        {
          prompt: 'Que retourne `typeof null` en JS ?',
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
      lesson: lessonExpress._id,
      passingScore: 50,
      questions: [
        {
          prompt: 'Quel framework simplifie la création de serveurs HTTP en Node.js ?',
          choices: ['React', 'Express', 'Mongoose', 'Vite'],
          correctIndexes: [1],
        },
        {
          prompt: 'Quelle méthode HTTP est utilisée pour créer une ressource ?',
          choices: ['GET', 'POST', 'PUT', 'DELETE'],
          correctIndexes: [1],
        },
        {
          prompt: 'Quelles méthodes HTTP modifient des données ? (plusieurs réponses)',
          choices: ['GET', 'POST', 'PUT', 'DELETE'],
          correctIndexes: [1, 2, 3],
        },
      ],
    },
    {
      title: 'Quiz - React',
      lesson: lessonReactIntro._id,
      passingScore: 70,
      questions: [
        {
          prompt: 'Quel hook gère l\'état local d\'un composant ?',
          choices: ['useEffect', 'useState', 'useRef', 'useMemo'],
          correctIndexes: [1],
        },
        {
          prompt: 'Comment passe-t-on des données à un composant enfant ?',
          choices: ['via les props', 'via le state', 'via les hooks', 'via le DOM'],
          correctIndexes: [0],
        },
      ],
    },
  ])
  console.log('Quizzes créés')

  // ─── Attempts ─────────────────────────────────────────────────────────────
  // Bob : a réussi le quiz Variables (100%) et le quiz Express (réussi de justesse)
  // David : a échoué le quiz Variables puis l'a repassé avec succès
  await Attempt.insertMany([
    {
      student: bob._id,
      quiz: quizVar._id,
      answers: [2, 2, 1], // toutes correctes → 100%
      score: 100,
      passed: true,
      attemptedAt: new Date(Date.now() - day * 4),
    },
    {
      student: bob._id,
      quiz: quizExpress._id,
      answers: [1, 1, 1], // Q3 incomplète → 2/3 ≈ 67%
      score: 67,
      passed: true,
      attemptedAt: new Date(Date.now() - day * 1),
    },
    {
      student: david._id,
      quiz: quizVar._id,
      answers: [0, 0, 0], // tout faux → 0%
      score: 0,
      passed: false,
      attemptedAt: new Date(Date.now() - day * 3),
    },
    {
      student: david._id,
      quiz: quizVar._id,
      answers: [2, 2, 1], // rattrapage réussi → 100%
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
      lesson: lessonVar._id,
      message: 'La leçon "Variables et types" est maintenant disponible.',
      read: true,
      type: 'lesson',
    },
    {
      student: bob._id,
      lesson: lessonRoutes._id,
      message: 'La leçon "Routes et middlewares" est maintenant disponible.',
      read: false,
      type: 'lesson',
    },
    {
      student: clara._id,
      lesson: lessonExpress._id,
      message: 'La leçon "Introduction à Express" est maintenant disponible.',
      read: false,
      type: 'lesson',
    },
    {
      student: david._id,
      lesson: lessonRoutes._id,
      message: 'La leçon "Routes et middlewares" est maintenant disponible.',
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
  console.log('  emma@corelab.dev      → Student1234! (cours React)')

  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  mongoose.disconnect()
  process.exit(1)
})

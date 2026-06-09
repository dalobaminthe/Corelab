import request from 'supertest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import app from '../src/app.js'
import User from '../src/models/User.js'
import Course from '../src/models/Course.js'
import Lesson from '../src/models/Lesson.js'
import Quiz from '../src/models/Quiz.js'

let mongod

// Configuration de la base de données en mémoire pour les tests
beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
  process.env.JWT_SECRET = 'test_secret'
})

// Nettoyage de la base après chaque test
afterEach(async () => {
  await User.deleteMany()
  await Course.deleteMany()
  await Lesson.deleteMany()
  await Quiz.deleteMany()
})

// Fermeture de la connexion après tous les tests
afterAll(async () => {
  await mongoose.disconnect()
  await mongod.stop()
})

// Fonctions utilitaires pour créer des utilisateurs, cours, leçons et quiz
const makeAdmin = async () => User.create({
  name: 'Admin',
  email: 'admin@test.com',
  passwordHash: await bcrypt.hash('Admin1234!', 10),
  role: 'admin',
  isFirstLogin: false,
})

// Crée un utilisateur étudiant
const makeStudent = async () => User.create({
  name: 'Student',
  email: 'student@test.com',
  passwordHash: await bcrypt.hash('Student1234!', 10),
  role: 'student',
  isFirstLogin: false,
})

// Génère un token JWT pour un utilisateur donné
const tokenFor = (user) => jwt.sign(
  { userId: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
)

// Crée un cours associé à un administrateur
const makeCourse = async (admin) => Course.create({
  title: 'Cours test',
  createdBy: admin._id,
})

// Crée une leçon associée à un cours
const makeLesson = async (course) => Lesson.create({
  title: 'Leçon test',
  content: '<h1>Contenu</h1>',
  courseId: course._id,
  availableFrom: new Date(),
})

// Crée un quiz associé à une leçon
const makeQuiz = async (lesson) => Quiz.create({
  title: 'Quiz test',
  lesson: lesson._id,
  passingScore: 50,
  questions: [
    {
      prompt: 'Question 1 ?',
      choices: ['A', 'B', 'C'],
      correctIndexes: [0],
    },
  ],
})

// ─── POST /api/admin/lessons ──────────────────────────────────────────────────
describe('POST /api/admin/lessons', () => {
  it('crée une leçon HTML', async () => {
    const admin = await makeAdmin()
    const course = await makeCourse(admin)
    const token = tokenFor(admin)
    const res = await request(app)
      .post('/api/admin/lessons')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Ma leçon', content: '<p>Contenu</p>', courseId: course._id.toString() })
    expect(res.status).toBe(201)
    expect(res.body.title).toBe('Ma leçon')
  })

  it('retourne 403 si appelé par un student', async () => {
    const admin = await makeAdmin()
    const student = await makeStudent()
    const course = await makeCourse(admin)
    const token = tokenFor(student)
    const res = await request(app)
      .post('/api/admin/lessons')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Ma leçon', content: '<p>Contenu</p>', courseId: course._id.toString() })
    expect(res.status).toBe(403)
  })

  it('retourne 401 sans token', async () => {
    const res = await request(app)
      .post('/api/admin/lessons')
      .send({ title: 'Ma leçon', content: '<p>Contenu</p>' })
    expect(res.status).toBe(401)
  })
})

// ─── PUT /api/admin/lessons/:id ───────────────────────────────────────────────
describe('PUT /api/admin/lessons/:id', () => {
  it('modifie une leçon existante', async () => {
    const admin = await makeAdmin()
    const course = await makeCourse(admin)
    const lesson = await makeLesson(course)
    const token = tokenFor(admin)
    const res = await request(app)
      .put(`/api/admin/lessons/${lesson._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Titre modifié' })
    expect(res.status).toBe(200)
    expect(res.body.title).toBe('Titre modifié')
  })

  it('retourne 404 si leçon inexistante', async () => {
    const admin = await makeAdmin()
    const token = tokenFor(admin)
    const fakeId = new mongoose.Types.ObjectId()
    const res = await request(app)
      .put(`/api/admin/lessons/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Titre modifié' })
    expect(res.status).toBe(404)
  })

  it('retourne 403 si appelé par un student', async () => {
    const admin = await makeAdmin()
    const student = await makeStudent()
    const course = await makeCourse(admin)
    const lesson = await makeLesson(course)
    const token = tokenFor(student)
    const res = await request(app)
      .put(`/api/admin/lessons/${lesson._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Titre modifié' })
    expect(res.status).toBe(403)
  })
})

// ─── PATCH /api/admin/lessons/:id/schedule ────────────────────────────────────
describe('PATCH /api/admin/lessons/:id/schedule', () => {
  it('met à jour la date de disponibilité', async () => {
    const admin = await makeAdmin()
    const course = await makeCourse(admin)
    const lesson = await makeLesson(course)
    const token = tokenFor(admin)
    const newDate = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()
    const res = await request(app)
      .patch(`/api/admin/lessons/${lesson._id}/schedule`)
      .set('Authorization', `Bearer ${token}`)
      .send({ availableFrom: newDate })
    expect(res.status).toBe(200)
    expect(new Date(res.body.availableFrom).getTime()).toBeGreaterThan(Date.now())
  })

  it('retourne 404 si leçon inexistante', async () => {
    const admin = await makeAdmin()
    const token = tokenFor(admin)
    const fakeId = new mongoose.Types.ObjectId()
    const res = await request(app)
      .patch(`/api/admin/lessons/${fakeId}/schedule`)
      .set('Authorization', `Bearer ${token}`)
      .send({ availableFrom: new Date().toISOString() })
    expect(res.status).toBe(404)
  })
})

// ─── POST /api/admin/quizzes/import ──────────────────────────────────────────
describe('POST /api/admin/quizzes/import', () => {
  it('importe un quiz depuis JSON', async () => {
    const admin = await makeAdmin()
    const course = await makeCourse(admin)
    const lesson = await makeLesson(course)
    const token = tokenFor(admin)
    const res = await request(app)
      .post('/api/admin/quizzes/import')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Quiz importé',
        lesson: lesson._id.toString(),
        passingScore: 60,
        questions: [
          {
            prompt: 'Quelle est la capitale de la France ?',
            choices: ['Lyon', 'Paris', 'Marseille'],
            correctIndexes: [1],
          },
        ],
      })
    expect(res.status).toBe(201)
    expect(res.body.title).toBe('Quiz importé')
  })

  it('retourne 400 si correctIndexes invalides', async () => {
    const admin = await makeAdmin()
    const course = await makeCourse(admin)
    const lesson = await makeLesson(course)
    const token = tokenFor(admin)
    const res = await request(app)
      .post('/api/admin/quizzes/import')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Quiz invalide',
        lesson: lesson._id.toString(),
        passingScore: 50,
        questions: [
          {
            prompt: 'Question ?',
            choices: ['A', 'B'],
            correctIndexes: [5], // index hors bornes
          },
        ],
      })
    expect(res.status).toBe(400)
  })

  it('retourne 403 si appelé par un student', async () => {
    const admin = await makeAdmin()
    const student = await makeStudent()
    const course = await makeCourse(admin)
    const lesson = await makeLesson(course)
    const token = tokenFor(student)
    const res = await request(app)
      .post('/api/admin/quizzes/import')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Quiz',
        lesson: lesson._id.toString(),
        passingScore: 50,
        questions: [{ prompt: 'Q?', choices: ['A', 'B'], correctIndexes: [0] }],
      })
    expect(res.status).toBe(403)
  })
})

// ─── PATCH /api/admin/quizzes/:id/passing-score ───────────────────────────────
describe('PATCH /api/admin/quizzes/:id/passing-score', () => {
  it('met à jour le seuil de réussite', async () => {
    const admin = await makeAdmin()
    const course = await makeCourse(admin)
    const lesson = await makeLesson(course)
    const quiz = await makeQuiz(lesson)
    const token = tokenFor(admin)
    const res = await request(app)
      .patch(`/api/admin/quizzes/${quiz._id}/passing-score`)
      .set('Authorization', `Bearer ${token}`)
      .send({ passingScore: 75 })
    expect(res.status).toBe(200)
    expect(res.body.passingScore).toBe(75)
  })

  it('retourne 400 si passingScore hors bornes', async () => {
    const admin = await makeAdmin()
    const course = await makeCourse(admin)
    const lesson = await makeLesson(course)
    const quiz = await makeQuiz(lesson)
    const token = tokenFor(admin)
    const res = await request(app)
      .patch(`/api/admin/quizzes/${quiz._id}/passing-score`)
      .set('Authorization', `Bearer ${token}`)
      .send({ passingScore: 150 })
    expect(res.status).toBe(400)
  })

  it('retourne 404 si quiz inexistant', async () => {
    const admin = await makeAdmin()
    const token = tokenFor(admin)
    const fakeId = new mongoose.Types.ObjectId()
    const res = await request(app)
      .patch(`/api/admin/quizzes/${fakeId}/passing-score`)
      .set('Authorization', `Bearer ${token}`)
      .send({ passingScore: 60 })
    expect(res.status).toBe(404)
  })
})
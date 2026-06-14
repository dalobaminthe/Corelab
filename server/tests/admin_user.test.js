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
import Attempt from '../src/models/Attempt.js'

let mongod

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
  process.env.JWT_SECRET = 'test_secret'
})

afterEach(async () => {
  await User.deleteMany()
  await Course.deleteMany()
  await Lesson.deleteMany()
  await Quiz.deleteMany()
  await Attempt.deleteMany()
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongod.stop()
})

// ─── Utilitaires ──────────────────────────────────────────────────────────────

const makeAdmin = async () => User.create({
  name: 'Admin',
  email: 'admin@test.com',
  passwordHash: await bcrypt.hash('Admin1234!', 10),
  role: 'admin',
  isFirstLogin: false,
})

const makeStudent = async () => User.create({
  name: 'Student',
  email: 'student@test.com',
  passwordHash: await bcrypt.hash('Student1234!', 10),
  role: 'student',
  isFirstLogin: false,
})

const tokenFor = (user) => jwt.sign(
  { userId: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
)

const makeCourse = async (admin) => Course.create({
  title: 'Cours test',
  createdBy: admin._id,
})

const makeLesson = async (course) => Lesson.create({
  title: 'Leçon test',
  content: '<h1>Contenu</h1>',
  courseId: course._id,
  availableFrom: new Date(),
})

const makeQuiz = async (lesson) => Quiz.create({
  title: 'Quiz test',
  lesson: lesson._id,
  passingScore: 50,
  questions: [{ prompt: 'Q?', choices: ['A', 'B'], correctIndexes: [0] }],
})

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────
describe('GET /api/admin/stats', () => {
  it('retourne les stats globales', async () => {
    const admin = await makeAdmin()
    await makeStudent()
    await makeCourse(admin)
    const token = tokenFor(admin)
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.totalStudents).toBe(1)
    expect(res.body.totalCourses).toBe(1)
    expect(res.body.totalAttempts).toBe(0)
    expect(res.body.successRate).toBe(0)
  })

  it('calcule le taux de réussite correctement', async () => {
    const admin = await makeAdmin()
    const student = await makeStudent()
    const course = await makeCourse(admin)
    const lesson = await makeLesson(course)
    const quiz = await makeQuiz(lesson)
    await Attempt.create({ student: student._id, quiz: quiz._id, answers: [0], score: 100, passed: true })
    await Attempt.create({ student: student._id, quiz: quiz._id, answers: [1], score: 0, passed: false })
    const token = tokenFor(admin)
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.successRate).toBe(50)
  })

  it('retourne 403 si appelé par un student', async () => {
    const student = await makeStudent()
    const token = tokenFor(student)
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(403)
  })

  it('retourne 401 sans token', async () => {
    const res = await request(app).get('/api/admin/stats')
    expect(res.status).toBe(401)
  })
})

// ─── GET /api/admin/courses ───────────────────────────────────────────────────
describe('GET /api/admin/courses', () => {
  it('retourne la liste des cours avec leurs étudiants', async () => {
    const admin = await makeAdmin()
    await makeCourse(admin)
    await makeCourse(admin)
    const token = tokenFor(admin)
    const res = await request(app)
      .get('/api/admin/courses')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(2)
  })

  it('retourne 403 si appelé par un student', async () => {
    const student = await makeStudent()
    const token = tokenFor(student)
    const res = await request(app)
      .get('/api/admin/courses')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(403)
  })

  it('retourne 401 sans token', async () => {
    const res = await request(app).get('/api/admin/courses')
    expect(res.status).toBe(401)
  })
})

// ─── GET /api/admin/activity ──────────────────────────────────────────────────
describe('GET /api/admin/activity', () => {
  it('retourne les 20 dernières tentatives', async () => {
    const admin = await makeAdmin()
    const student = await makeStudent()
    const course = await makeCourse(admin)
    const lesson = await makeLesson(course)
    const quiz = await makeQuiz(lesson)
    await Attempt.create({ student: student._id, quiz: quiz._id, answers: [0], score: 100, passed: true })
    const token = tokenFor(admin)
    const res = await request(app)
      .get('/api/admin/activity')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].student.name).toBe('Student')
  })

  it('retourne un tableau vide si aucune tentative', async () => {
    const admin = await makeAdmin()
    const token = tokenFor(admin)
    const res = await request(app)
      .get('/api/admin/activity')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(0)
  })

  it('retourne 403 si appelé par un student', async () => {
    const student = await makeStudent()
    const token = tokenFor(student)
    const res = await request(app)
      .get('/api/admin/activity')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(403)
  })

  it('retourne 401 sans token', async () => {
    const res = await request(app).get('/api/admin/activity')
    expect(res.status).toBe(401)
  })
})
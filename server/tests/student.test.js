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

const makeStudent = async () => User.create({
  name: 'Student',
  email: 'student@test.com',
  passwordHash: await bcrypt.hash('Student1234!', 10),
  role: 'student',
  isFirstLogin: false,
})

const makeAdmin = async () => User.create({
  name: 'Admin',
  email: 'admin@test.com',
  passwordHash: await bcrypt.hash('Admin1234!', 10),
  role: 'admin',
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

const makeLesson = async (course, { available = true } = {}) => Lesson.create({
  title: 'Leçon test',
  content: '<h1>Contenu</h1>',
  courseId: course._id,
  availableFrom: available
    ? new Date(Date.now() - 1000 * 60 * 60)
    : new Date(Date.now() + 1000 * 60 * 60 * 24),
})

const makeQuiz = async (lesson) => Quiz.create({
  title: 'Quiz test',
  lesson: lesson._id,
  passingScore: 50,
  questions: [
    { prompt: 'Question 1 ?', choices: ['A', 'B', 'C'], correctIndexes: [0] },
    { prompt: 'Question 2 ?', choices: ['X', 'Y', 'Z'], correctIndexes: [1] },
  ],
})

// ─── GET /api/student/courses ─────────────────────────────────────────────────
describe('GET /api/student/courses', () => {
  it('retourne les cours de l étudiant connecté', async () => {
    const admin = await makeAdmin()
    const student = await makeStudent()
    const course = await makeCourse(admin)
    await User.findByIdAndUpdate(student._id, { courses: [course._id] })
    const token = tokenFor(student)
    const res = await request(app)
      .get('/api/student/courses')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].title).toBe('Cours test')
  })

  it('retourne un tableau vide si aucun cours assigné', async () => {
    const student = await makeStudent()
    const token = tokenFor(student)
    const res = await request(app)
      .get('/api/student/courses')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(0)
  })

  it('retourne 401 sans token', async () => {
    const res = await request(app).get('/api/student/courses')
    expect(res.status).toBe(401)
  })
})

// ─── GET /api/student/lessons ─────────────────────────────────────────────────
describe('GET /api/student/lessons', () => {
  it('retourne les leçons disponibles du cours', async () => {
    const admin = await makeAdmin()
    const student = await makeStudent()
    const course = await makeCourse(admin)
    await makeLesson(course, { available: true })
    await makeLesson(course, { available: false })
    const token = tokenFor(student)
    const res = await request(app)
      .get(`/api/student/lessons?courseId=${course._id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
  })

  it('retourne 401 sans token', async () => {
    const res = await request(app).get('/api/student/lessons')
    expect(res.status).toBe(401)
  })
})

// ─── GET /api/student/lessons/:id/quiz ───────────────────────────────────────
describe('GET /api/student/lessons/:id/quiz', () => {
  it('retourne le quiz de la leçon sans les correctIndexes', async () => {
    const admin = await makeAdmin()
    const student = await makeStudent()
    const course = await makeCourse(admin)
    const lesson = await makeLesson(course)
    await makeQuiz(lesson)
    const token = tokenFor(student)
    const res = await request(app)
      .get(`/api/student/lessons/${lesson._id}/quiz`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.questions[0].correctIndexes).toBeUndefined()
  })

  it('retourne 404 si aucun quiz pour cette leçon', async () => {
    const admin = await makeAdmin()
    const student = await makeStudent()
    const course = await makeCourse(admin)
    const lesson = await makeLesson(course)
    const token = tokenFor(student)
    const res = await request(app)
      .get(`/api/student/lessons/${lesson._id}/quiz`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(404)
  })

  it('retourne 401 sans token', async () => {
    const admin = await makeAdmin()
    const course = await makeCourse(admin)
    const lesson = await makeLesson(course)
    const res = await request(app).get(`/api/student/lessons/${lesson._id}/quiz`)
    expect(res.status).toBe(401)
  })
})

// ─── GET /api/student/lessons/:id ────────────────────────────────────────────
describe('GET /api/student/lessons/:id', () => {
  it('retourne le contenu d une leçon disponible', async () => {
    const admin = await makeAdmin()
    const student = await makeStudent()
    const course = await makeCourse(admin)
    const lesson = await makeLesson(course, { available: true })
    const token = tokenFor(student)
    const res = await request(app)
      .get(`/api/student/lessons/${lesson._id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.title).toBe('Leçon test')
  })

  it('retourne 403 si leçon pas encore disponible', async () => {
    const admin = await makeAdmin()
    const student = await makeStudent()
    const course = await makeCourse(admin)
    const lesson = await makeLesson(course, { available: false })
    const token = tokenFor(student)
    const res = await request(app)
      .get(`/api/student/lessons/${lesson._id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(403)
  })

  it('retourne 404 si leçon inexistante', async () => {
    const student = await makeStudent()
    const token = tokenFor(student)
    const fakeId = new mongoose.Types.ObjectId()
    const res = await request(app)
      .get(`/api/student/lessons/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(404)
  })

  it('retourne 401 sans token', async () => {
    const admin = await makeAdmin()
    const course = await makeCourse(admin)
    const lesson = await makeLesson(course)
    const res = await request(app).get(`/api/student/lessons/${lesson._id}`)
    expect(res.status).toBe(401)
  })
})

// ─── GET /api/student/quizzes/:id ────────────────────────────────────────────
describe('GET /api/student/quizzes/:id', () => {
  it('retourne le quiz sans les correctIndexes', async () => {
    const admin = await makeAdmin()
    const student = await makeStudent()
    const course = await makeCourse(admin)
    const lesson = await makeLesson(course)
    const quiz = await makeQuiz(lesson)
    const token = tokenFor(student)
    const res = await request(app)
      .get(`/api/student/quizzes/${quiz._id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.questions[0].correctIndexes).toBeUndefined()
  })

  it('retourne 404 si quiz inexistant', async () => {
    const student = await makeStudent()
    const token = tokenFor(student)
    const fakeId = new mongoose.Types.ObjectId()
    const res = await request(app)
      .get(`/api/student/quizzes/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(404)
  })

  it('retourne 401 sans token', async () => {
    const admin = await makeAdmin()
    const course = await makeCourse(admin)
    const lesson = await makeLesson(course)
    const quiz = await makeQuiz(lesson)
    const res = await request(app).get(`/api/student/quizzes/${quiz._id}`)
    expect(res.status).toBe(401)
  })
})

// ─── POST /api/student/quizzes/submit ────────────────────────────────────────
describe('POST /api/student/quizzes/submit', () => {
  it('calcule le score et sauvegarde la tentative', async () => {
    const admin = await makeAdmin()
    const student = await makeStudent()
    const course = await makeCourse(admin)
    const lesson = await makeLesson(course)
    const quiz = await makeQuiz(lesson)
    const token = tokenFor(student)
    const res = await request(app)
      .post('/api/student/quizzes/submit')
      .set('Authorization', `Bearer ${token}`)
      .send({ quizId: quiz._id.toString(), answers: [0, 1] })
    expect(res.status).toBe(201)
    expect(res.body.score).toBe(100)
    expect(res.body.passed).toBe(true)
  })

  it('retourne passed true si score égal au passingScore', async () => {
    const admin = await makeAdmin()
    const student = await makeStudent()
    const course = await makeCourse(admin)
    const lesson = await makeLesson(course)
    const quiz = await makeQuiz(lesson)
    const token = tokenFor(student)
    const res = await request(app)
      .post('/api/student/quizzes/submit')
      .set('Authorization', `Bearer ${token}`)
      .send({ quizId: quiz._id.toString(), answers: [1, 1] })
    expect(res.status).toBe(201)
    expect(res.body.score).toBe(50)
    expect(res.body.passed).toBe(true)
  })

  it('retourne 400 si nombre de réponses incorrect', async () => {
    const admin = await makeAdmin()
    const student = await makeStudent()
    const course = await makeCourse(admin)
    const lesson = await makeLesson(course)
    const quiz = await makeQuiz(lesson)
    const token = tokenFor(student)
    const res = await request(app)
      .post('/api/student/quizzes/submit')
      .set('Authorization', `Bearer ${token}`)
      .send({ quizId: quiz._id.toString(), answers: [0] })
    expect(res.status).toBe(400)
  })

  it('retourne 401 sans token', async () => {
    const res = await request(app)
      .post('/api/student/quizzes/submit')
      .send({ quizId: new mongoose.Types.ObjectId().toString(), answers: [0] })
    expect(res.status).toBe(401)
  })
})

// ─── GET /api/student/progress/:courseId ─────────────────────────────────────
describe('GET /api/student/progress/:courseId', () => {
  it('retourne 0% si aucun quiz passé', async () => {
    const admin = await makeAdmin()
    const student = await makeStudent()
    const course = await makeCourse(admin)
    await makeLesson(course)
    const token = tokenFor(student)
    const res = await request(app)
      .get(`/api/student/progress/${course._id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.progressPercent).toBe(0)
    expect(res.body.totalLessons).toBe(1)
  })

  it('retourne 100% si tous les quiz passés', async () => {
    const admin = await makeAdmin()
    const student = await makeStudent()
    const course = await makeCourse(admin)
    const lesson = await makeLesson(course)
    const quiz = await makeQuiz(lesson)
    await Attempt.create({
      student: student._id,
      quiz: quiz._id,
      answers: [0, 1],
      score: 100,
      passed: true,
    })
    const token = tokenFor(student)
    const res = await request(app)
      .get(`/api/student/progress/${course._id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.progressPercent).toBe(100)
    expect(res.body.completedLessons).toBe(1)
  })

  it('retourne 0% si cours sans leçons', async () => {
    const admin = await makeAdmin()
    const student = await makeStudent()
    const course = await makeCourse(admin)
    const token = tokenFor(student)
    const res = await request(app)
      .get(`/api/student/progress/${course._id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.progressPercent).toBe(0)
    expect(res.body.totalLessons).toBe(0)
  })

  it('retourne 401 sans token', async () => {
    const res = await request(app)
      .get(`/api/student/progress/${new mongoose.Types.ObjectId()}`)
    expect(res.status).toBe(401)
  })
})
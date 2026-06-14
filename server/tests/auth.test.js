import { jest } from '@jest/globals'
import request from 'supertest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import app from '../src/app.js'
import User from '../src/models/User.js'
import Course from '../src/models/Course.js'

let mongod

// Configuration de Jest pour utiliser un MongoDB en mémoire
beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
  process.env.JWT_SECRET = 'test_secret'
})

// Nettoyage de la base après chaque test
afterEach(async () => {
  await User.deleteMany()
  await Course.deleteMany()
})

// Fermeture de la connexion après tous les tests
afterAll(async () => {
  await mongoose.disconnect()
  await mongod.stop()
})

// Helpers pour créer des users et générer des tokens
const makeAdmin = async () => User.create({
  name: 'Admin',
  email: 'admin@test.com',
  passwordHash: await bcrypt.hash('Admin1234!', 10),
  role: 'admin',
  isFirstLogin: false,
})

// Helper pour créer un étudiant avec isFirstLogin à true
const makeStudent = async () => User.create({
  name: 'Student',
  email: 'student@test.com',
  passwordHash: await bcrypt.hash('Student1234!', 10),
  role: 'student',
  isFirstLogin: true,
})

// Helper pour générer un token JWT pour un user donné
const tokenFor = (user) => jwt.sign(
  { userId: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
)

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  it('retourne un token avec credentials valides', async () => {
    await makeAdmin()
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'Admin1234!' })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    expect(res.body.user.email).toBe('admin@test.com')
  })

  it('retourne 401 si mot de passe incorrect', async () => {
    await makeAdmin()
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'mauvais' })
    expect(res.status).toBe(401)
  })

  it('retourne 401 si email inconnu', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'inconnu@test.com', password: 'Admin1234!' })
    expect(res.status).toBe(401)
  })
})

// ─── POST /api/auth/set-password ─────────────────────────────────────────────
describe('POST /api/auth/set-password', () => {
  it('met à jour le mot de passe et passe isFirstLogin à false', async () => {
    const student = await makeStudent()
    const token = tokenFor(student)
    const res = await request(app)
      .post('/api/auth/set-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ newPassword: 'NouveauMdp1234!' })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    const updated = await User.findById(student._id)
    expect(updated.isFirstLogin).toBe(false)
  })

  it('retourne 401 sans token', async () => {
    const res = await request(app)
      .post('/api/auth/set-password')
      .send({ newPassword: 'NouveauMdp1234!' })
    expect(res.status).toBe(401)
  })

  it('retourne 400 si nouveau mot de passe trop court', async () => {
    const student = await makeStudent()
    const token = tokenFor(student)
    const res = await request(app)
      .post('/api/auth/set-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ newPassword: 'court' })
    expect(res.status).toBe(400)
  })
})

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
describe('GET /api/auth/me', () => {
  it('retourne le profil du user authentifié', async () => {
    const admin = await makeAdmin()
    const token = tokenFor(admin)
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.email).toBe('admin@test.com')
    expect(res.body.passwordHash).toBeUndefined()
  })

  it('retourne 401 sans token', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
  })
})

// ─── Middleware verifyToken ───────────────────────────────────────────────────
describe('verifyToken middleware', () => {
  it('retourne 401 si token expiré', async () => {
    const admin = await makeAdmin()
    const token = jwt.sign(
      { userId: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '0s' }
    )
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(401)
  })

  it('retourne 401 si token malformé', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer tokenbidon')
    expect(res.status).toBe(401)
  })
})

// ─── Middleware requireAdmin ──────────────────────────────────────────────────
describe('requireAdmin middleware', () => {
  it('retourne 403 si role === student', async () => {
    const student = await makeStudent()
    const token = tokenFor(student)
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(403)
  })

  it('laisse passer si role === admin', async () => {
    const admin = await makeAdmin()
    const token = tokenFor(admin)
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
  })
})

// ─── POST /api/admin/users/import ────────────────────────────────────────────
describe('POST /api/admin/users/import', () => {
  it('importe des users depuis un tableau JSON', async () => {
    const admin = await makeAdmin()
    const token = tokenFor(admin)
    const res = await request(app)
      .post('/api/admin/users/import')
      .set('Authorization', `Bearer ${token}`)
      .send([
        { name: 'Alice', email: 'alice@test.com' },
        { name: 'Bob', email: 'bob@test.com' },
      ])
    expect(res.status).toBe(201)
    expect(res.body.created).toHaveLength(2)
    expect(res.body.skipped).toHaveLength(0)
  })

  it('skippe les emails déjà existants', async () => {
    const admin = await makeAdmin()
    const token = tokenFor(admin)
    await request(app)
      .post('/api/admin/users/import')
      .set('Authorization', `Bearer ${token}`)
      .send([{ name: 'Alice', email: 'alice@test.com' }])
    const res = await request(app)
      .post('/api/admin/users/import')
      .set('Authorization', `Bearer ${token}`)
      .send([{ name: 'Alice', email: 'alice@test.com' }])
    expect(res.body.skipped).toHaveLength(1)
    expect(res.body.created).toHaveLength(0)
  })

  it('retourne 403 si appelé par un student', async () => {
    const student = await makeStudent()
    const token = tokenFor(student)
    const res = await request(app)
      .post('/api/admin/users/import')
      .set('Authorization', `Bearer ${token}`)
      .send([{ name: 'Alice', email: 'alice@test.com' }])
    expect(res.status).toBe(403)
  })
})

// ─── PUT /api/admin/users/:id/courses ────────────────────────────────────────
describe('PUT /api/admin/users/:id/courses', () => {
  it('met à jour les cours d un étudiant', async () => {
    const admin = await makeAdmin()
    const student = await makeStudent()
    const token = tokenFor(admin)
    const course = await Course.create({ title: 'Cours 1', createdBy: admin._id })
    const res = await request(app)
      .put(`/api/admin/users/${student._id}/courses`)
      .set('Authorization', `Bearer ${token}`)
      .send({ courseIds: [course._id.toString()] })
    expect(res.status).toBe(200)
    expect(res.body.courses).toHaveLength(1)
  })

  it('retourne 400 si courseIds contient un ObjectId invalide', async () => {
    const admin = await makeAdmin()
    const student = await makeStudent()
    const token = tokenFor(admin)
    const res = await request(app)
      .put(`/api/admin/users/${student._id}/courses`)
      .set('Authorization', `Bearer ${token}`)
      .send({ courseIds: ['pasunobjid'] })
    expect(res.status).toBe(400)
  })

  it('retourne 400 si courseIds contient un cours inexistant', async () => {
    const admin = await makeAdmin()
    const student = await makeStudent()
    const token = tokenFor(admin)
    const fakeId = new mongoose.Types.ObjectId()
    const res = await request(app)
      .put(`/api/admin/users/${student._id}/courses`)
      .set('Authorization', `Bearer ${token}`)
      .send({ courseIds: [fakeId.toString()] })
    expect(res.status).toBe(400)
  })
})

// ─── POST /api/admin/courses ──────────────────────────────────────────────────
describe('POST /api/admin/courses', () => {
  it('crée un cours', async () => {
    const admin = await makeAdmin()
    const token = tokenFor(admin)
    const res = await request(app)
      .post('/api/admin/courses')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Nouveau cours', description: 'Description test' })
    expect(res.status).toBe(201)
    expect(res.body.title).toBe('Nouveau cours')
  })

  it('retourne 400 si title manquant', async () => {
    const admin = await makeAdmin()
    const token = tokenFor(admin)
    const res = await request(app)
      .post('/api/admin/courses')
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'Sans titre' })
    expect(res.status).toBe(400)
  })

  it('retourne 403 si appelé par un student', async () => {
    const student = await makeStudent()
    const token = tokenFor(student)
    const res = await request(app)
      .post('/api/admin/courses')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Cours' })
    expect(res.status).toBe(403)
  })

  it('retourne 401 sans token', async () => {
    const res = await request(app)
      .post('/api/admin/courses')
      .send({ title: 'Cours' })
    expect(res.status).toBe(401)
  })
})

// ─── PUT /api/admin/courses/:id ──────────────────────────────────────────────
describe('PUT /api/admin/courses/:id', () => {
  it('modifie le titre d un cours existant', async () => {
    const admin = await makeAdmin()
    const token = tokenFor(admin)
    const course = await Course.create({ title: 'Ancien titre', createdBy: admin._id })
    const res = await request(app)
      .put(`/api/admin/courses/${course._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Nouveau titre' })
    expect(res.status).toBe(200)
    expect(res.body.title).toBe('Nouveau titre')
  })

  it('retourne 404 si cours inexistant', async () => {
    const admin = await makeAdmin()
    const token = tokenFor(admin)
    const fakeId = new mongoose.Types.ObjectId()
    const res = await request(app)
      .put(`/api/admin/courses/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Titre' })
    expect(res.status).toBe(404)
  })

  it('retourne 403 si appelé par un student', async () => {
    const admin = await makeAdmin()
    const student = await makeStudent()
    const token = tokenFor(student)
    const course = await Course.create({ title: 'Cours', createdBy: admin._id })
    const res = await request(app)
      .put(`/api/admin/courses/${course._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Titre' })
    expect(res.status).toBe(403)
  })

  it('retourne 401 sans token', async () => {
    const admin = await makeAdmin()
    const course = await Course.create({ title: 'Cours', createdBy: admin._id })
    const res = await request(app)
      .put(`/api/admin/courses/${course._id}`)
      .send({ title: 'Titre' })
    expect(res.status).toBe(401)
  })
})

// ─── DELETE /api/admin/courses/:id ───────────────────────────────────────────
describe('DELETE /api/admin/courses/:id', () => {
  it('supprime un cours existant', async () => {
    const admin = await makeAdmin()
    const token = tokenFor(admin)
    const course = await Course.create({ title: 'Cours à supprimer', createdBy: admin._id })
    const res = await request(app)
      .delete(`/api/admin/courses/${course._id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Course deleted')
  })

  it('retire le cours des étudiants assignés', async () => {
    const admin = await makeAdmin()
    const student = await makeStudent()
    const token = tokenFor(admin)
    const course = await Course.create({
      title: 'Cours',
      createdBy: admin._id,
      students: [student._id]
    })
    await User.findByIdAndUpdate(student._id, { courses: [course._id] })
    await request(app)
      .delete(`/api/admin/courses/${course._id}`)
      .set('Authorization', `Bearer ${token}`)
    const updatedStudent = await User.findById(student._id)
    expect(updatedStudent.courses).toHaveLength(0)
  })

  it('retourne 404 si cours inexistant', async () => {
    const admin = await makeAdmin()
    const token = tokenFor(admin)
    const fakeId = new mongoose.Types.ObjectId()
    const res = await request(app)
      .delete(`/api/admin/courses/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(404)
  })

  it('retourne 403 si appelé par un student', async () => {
    const admin = await makeAdmin()
    const student = await makeStudent()
    const token = tokenFor(student)
    const course = await Course.create({ title: 'Cours', createdBy: admin._id })
    const res = await request(app)
      .delete(`/api/admin/courses/${course._id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(403)
  })

  it('retourne 401 sans token', async () => {
    const admin = await makeAdmin()
    const course = await Course.create({ title: 'Cours', createdBy: admin._id })
    const res = await request(app)
      .delete(`/api/admin/courses/${course._id}`)
    expect(res.status).toBe(401)
  })
})
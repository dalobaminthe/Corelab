import { z } from 'zod'

const objectIdRegex = /^[a-f\d]{24}$/i

// ─── Schemas ──────────────────────────────────────────────────────────────────
// ─── Schémas Auth ─────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const setPasswordSchema = z.object({
  newPassword: z.string().min(8),
})

// ─── Schémas Cours ────────────────────────────────────────────────────────────

const createCourseSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
})

// ─── Schémas Leçon ────────────────────────────────────────────────────────────

const importLessonSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  courseId: z.string().regex(objectIdRegex),
  order: z.number().optional().default(0),
  availableFrom: z.string().optional(),
})

// Champs optionnels - on ne met à jour que ce qui est envoyé

const patchLessonSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  availableFrom: z.string().datetime().nullable().optional(),
  order: z.number().optional(),
  cohort: z.array(z.string().regex(objectIdRegex)).optional(),
})

// ─── Schémas Utilisateurs ─────────────────────────────────────────────────────

const assignCoursesSchema = z.object({
  courseIds: z.array(z.string().regex(objectIdRegex)).min(0),
})

// ─── Schémas QCM & Attempt ────────────────────────────────────────────────────

const importQuizSchema = z.object({
  title: z.string().min(1),
  lesson: z.string().regex(objectIdRegex),
  passingScore: z.number().min(0).max(100),
  questions: z.array(z.object({
    prompt: z.string().min(1),
    choices: z.array(z.string()).min(2),
    correctIndexes: z.array(z.number()),
  })).min(1),
})

const submitAttemptSchema = z.object({
  quizId: z.string().regex(objectIdRegex),
  answers: z.array(z.number()),
})

// ─── validate (factory) ───────────────────────────────────────────────────────

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({
      error: 'Validation error',
      details: result.error.errors,
    })
  }
  req.body = result.data
  next()
}

export {
    validate,
    loginSchema,
    setPasswordSchema,
    createCourseSchema,
    importLessonSchema,
    patchLessonSchema,
    assignCoursesSchema,
    importQuizSchema,
    submitAttemptSchema,
};

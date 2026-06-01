import { z } from 'zod'

// ─── schemas ──────────────────────────────────────────────────────────────────
// Schémas Zod pour validation des payloads entrants.
// Chaque schéma correspond à une route ou un ensemble de routes.
// Dev C ajoutera ses schémas QCM/attempt dans ce même fichier (section dédiée).

// Auth
const registerSchema = z.object({
  // name : String non vide
  // email : format email valide
  // password : min 8 caractères
});

const loginSchema = z.object({
  // email : format email valide
  // password : String non vide
});

const setPasswordSchema = z.object({
  // newPassword : min 8 caractères
});

// Cours
const createCourseSchema = z.object({
  // title : String non vide
  // description : String optionnel
});

// Leçon (import)
const importLessonSchema = z.object({
  // title : String non vide
  // courseId : String (ObjectId valide — z.string().regex(/^[a-f\d]{24}$/i))
  // order : Number optionnel, défaut 0
  // availableAt : String ISO date optionnel
});

// Leçon (patch)
const patchLessonSchema = z.object({
  // title : String optionnel
  // htmlContent : String optionnel
  // availableAt : String ISO date optionnel, nullable
  // order : Number optionnel
  // cohort : tableau d'ObjectId optionnel
}).partial();

// Attribution de cours à un étudiant
const assignCoursesSchema = z.object({
  // courseIds : tableau d'ObjectId (min 0 éléments)
});

// ─── validate (factory) ───────────────────────────────────────────────────────
// Middleware factory — prend un schéma Zod et retourne un middleware Express.
//
// Fonctionnement :
//   1. Appelle schema.safeParse(req.body)
//   2. Si succès → remplace req.body par les données parsées (strip des champs
//      inconnus grâce à .strip() implicite de Zod) et appelle next()
//   3. Si échec  → retourne 400 { error: "Validation error", details: issues }
//      où issues est le tableau ZodError.errors formaté
//
// Utilisation dans une route :
//   router.post("/register", validate(registerSchema), (req, res) => { ... })
const validate = (schema) => (req, res, next) => {};


// ─── Schémas QCM & Attempt (Dev C) ───────────
const objectIdRegex = /^[a-f\d]{24}$/i

export const importQuizSchema = z.object({
  title: z.string().min(1),
  lesson: z.string().regex(objectIdRegex),
  passingScore: z.number().min(0).max(100),
  questions: z.array(z.object({
    prompt: z.string().min(1),
    choices: z.array(z.string()).min(2),
    correctIndexes: z.array(z.number()),
  })).min(1),
})

export const submitAttemptSchema = z.object({
  quizId: z.string().regex(objectIdRegex),
  answers: z.array(z.number()),
})

export {
  validate,
    registerSchema,
    loginSchema,
    setPasswordSchema,
    createCourseSchema,
    importLessonSchema,
    patchLessonSchema,
    assignCoursesSchema,
    importQuizSchema,
    submitAttemptSchema,
};
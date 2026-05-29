const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/index");

// ─── Setup / Teardown ─────────────────────────────────────────────────────────
// Connecte une base MongoDB de test avant tous les tests,
// vide les collections entre chaque test pour isolation,
// ferme la connexion après tous les tests.

beforeAll(async () => {
  // Se connecter à process.env.MONGO_URI_TEST ou une base en mémoire
  // (mongodb-memory-server recommandé pour éviter de polluer la vraie DB)
});

afterEach(async () => {
  // Vider les collections User, Course, Lesson après chaque test
  // pour garantir l'isolation entre cas de test
});

afterAll(async () => {
  // Fermer la connexion Mongoose proprement
  await mongoose.connection.close();
});

// ─── POST /api/auth/register ──────────────────────────────────────────────────
describe("POST /api/auth/register", () => {
  it("crée un utilisateur et retourne un token", async () => {
    // Envoyer { name, email, password } valides
    // Attendre status 201
    // Vérifier que la réponse contient token et user
    // Vérifier que user ne contient PAS passwordHash
  });

  it("retourne 400 si email manquant", async () => {
    // Envoyer body sans email
    // Attendre status 400
  });

  it("retourne 400 si password trop court", async () => {
    // Envoyer password < 8 caractères
    // Attendre status 400
  });

  it("retourne 409 si email déjà utilisé", async () => {
    // Créer un user en base avec le même email
    // Réenvoyer la même requête register
    // Attendre status 409
  });
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
describe("POST /api/auth/login", () => {
  it("retourne un token avec credentials valides", async () => {
    // Créer un User en base avec bcrypt.hash
    // Envoyer { email, password } corrects
    // Attendre status 200 avec token
  });

  it("retourne 401 si mot de passe incorrect", async () => {
    // Créer un User en base
    // Envoyer le bon email mais mauvais password
    // Attendre status 401
  });

  it("retourne 404 si email inconnu", async () => {
    // Envoyer un email qui n'existe pas en base
    // Attendre status 404
  });
});

// ─── POST /api/auth/set-password ─────────────────────────────────────────────
describe("POST /api/auth/set-password", () => {
  it("met à jour le mot de passe et passe isFirstLogin à false", async () => {
    // Créer un User avec isFirstLogin: true
    // Générer un JWT valide pour ce user
    // Envoyer { newPassword } avec Authorization header
    // Attendre status 200
    // Recharger le user en base et vérifier isFirstLogin === false
  });

  it("retourne 401 sans token", async () => {
    // Envoyer la requête sans Authorization header
    // Attendre status 401
  });

  it("retourne 400 si isFirstLogin déjà false", async () => {
    // Créer un User avec isFirstLogin: false
    // Envoyer la requête avec token valide
    // Attendre status 400
  });
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
describe("GET /api/auth/me", () => {
  it("retourne le profil du user authentifié", async () => {
    // Créer un User en base
    // Générer un JWT valide
    // Envoyer GET /api/auth/me avec Authorization header
    // Attendre status 200 avec les données du user
    // Vérifier l'absence de passwordHash dans la réponse
  });

  it("retourne 401 sans token", async () => {
    // Envoyer sans Authorization header
    // Attendre status 401
  });
});

// ─── Middleware verifyToken ───────────────────────────────────────────────────
describe("verifyToken middleware", () => {
  it("retourne 401 si token expiré", async () => {
    // Signer un JWT avec exp: 0 (déjà expiré)
    // Appeler n'importe quelle route protégée avec ce token
    // Attendre status 401
  });

  it("retourne 401 si token malformé", async () => {
    // Envoyer Authorization: Bearer notavalidtoken
    // Attendre status 401
  });
});

// ─── Middleware requireAdmin ──────────────────────────────────────────────────
describe("requireAdmin middleware", () => {
  it("retourne 403 si role === 'student'", async () => {
    // Créer un User role: 'student'
    // Générer JWT pour ce user
    // Appeler une route admin (ex: GET /api/admin/users)
    // Attendre status 403
  });

  it("laisse passer si role === 'admin'", async () => {
    // Créer un User role: 'admin'
    // Générer JWT pour ce user
    // Appeler une route admin
    // Attendre status 200 ou 201
  });
});

// ─── POST /api/admin/users/import ────────────────────────────────────────────
describe("POST /api/admin/users/import", () => {
  it("importe des users depuis un CSV valide", async () => {
    // Créer un admin + JWT admin
    // Envoyer multipart/form-data avec un CSV contenant 3 lignes name,email
    // Attendre status 201 avec { created: 3, skipped: 0 }
    // Vérifier en base que 3 Users ont été créés avec isFirstLogin: true
  });

  it("skippe les emails déjà existants", async () => {
    // Créer un User en base avec email X
    // Envoyer CSV avec email X + un email nouveau
    // Attendre { created: 1, skipped: 1 }
  });

  it("retourne 403 si appelé par un student", async () => {
    // Créer un student + JWT student
    // Envoyer la requête
    // Attendre status 403
  });
});

// ─── PUT /api/admin/users/:id/courses ────────────────────────────────────────
describe("PUT /api/admin/users/:id/courses", () => {
  it("met à jour les cours d'un étudiant", async () => {
    // Créer un admin, un student, deux courses
    // Envoyer PUT avec courseIds = [course1._id, course2._id]
    // Attendre status 200
    // Vérifier user.courses en base
  });

  it("retourne 400 si courseIds contient un ObjectId invalide", async () => {
    // Envoyer courseIds: ['notanobjectid']
    // Attendre status 400
  });
});
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/index");

// ─── Setup / Teardown ─────────────────────────────────────────────────────────
beforeAll(async () => {});

afterEach(async () => {});

afterAll(async () => {
  await mongoose.connection.close();
});

// ─── POST /api/auth/register ──────────────────────────────────────────────────
describe("POST /api/auth/register", () => {
  it("crée un utilisateur et retourne un token", async () => {
  });

  it("retourne 400 si email manquant", async () => {
  });

  it("retourne 400 si password trop court", async () => {
  
  });

  it("retourne 409 si email déjà utilisé", async () => {
  
  });
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
describe("POST /api/auth/login", () => {
  it("retourne un token avec credentials valides", async () => {
  
  });

  it("retourne 401 si mot de passe incorrect", async () => {
  
  });

  it("retourne 404 si email inconnu", async () => {
  
  });
});

// ─── POST /api/auth/set-password ─────────────────────────────────────────────
describe("POST /api/auth/set-password", () => {
  it("met à jour le mot de passe et passe isFirstLogin à false", async () => {
  
  });

  it("retourne 401 sans token", async () => {
  
  });

  it("retourne 400 si isFirstLogin déjà false", async () => {
  
  });
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
describe("GET /api/auth/me", () => {
  it("retourne le profil du user authentifié", async () => {
  
  });

  it("retourne 401 sans token", async () => {
  
  });
});

// ─── Middleware verifyToken ───────────────────────────────────────────────────
describe("verifyToken middleware", () => {
  it("retourne 401 si token expiré", async () => {
  
  });

  it("retourne 401 si token malformé", async () => {
  
  });
});

// ─── Middleware requireAdmin ──────────────────────────────────────────────────
describe("requireAdmin middleware", () => {
  it("retourne 403 si role === 'student'", async () => {
  
  });

  it("laisse passer si role === 'admin'", async () => {
  
  });
});

// ─── POST /api/admin/users/import ────────────────────────────────────────────
describe("POST /api/admin/users/import", () => {
  it("importe des users depuis un CSV valide", async () => {
  
  });

  it("skippe les emails déjà existants", async () => {
  
  });

  it("retourne 403 si appelé par un student", async () => {
  
  });
});

// ─── PUT /api/admin/users/:id/courses ────────────────────────────────────────
describe("PUT /api/admin/users/:id/courses", () => {
  it("met à jour les cours d'un étudiant", async () => {
  
  });

  it("retourne 400 si courseIds contient un ObjectId invalide", async () => {
  
  });
});
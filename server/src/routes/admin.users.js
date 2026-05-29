const express = require("express");
const router = express.Router();

// Toutes les routes protégées :
// - verifyToken  → vérifie le JWT
// - requireAdmin → vérifie que req.user.role === 'admin'
// Ces middlewares seront branchés dans index.js sur ce router.

// ─── UTILISATEURS ───────────────────────────────────────────────────────────

// POST /api/admin/users/import
router.post("/users/import", (req, res) => {});

// GET /api/admin/users
router.get("/users", (req, res) => {});

// GET /api/admin/users/:id
router.get("/users/:id", (req, res) => {});

// PUT /api/admin/users/:id/courses
router.put("/users/:id/courses", (req, res) => {});

// ─── COURS ───────────────────────────────────────────────────────────────────

// POST /api/admin/courses
router.post("/courses", (req, res) => {});

// GET /api/admin/courses
router.get("/courses", (req, res) => {});

// ─── LEÇONS ──────────────────────────────────────────────────────────────────

// POST /api/admin/lessons/import
router.post("/lessons/import", (req, res) => {});

// GET /api/admin/lessons
router.get("/lessons", (req, res) => {});

// PATCH /api/admin/lessons/:id
router.patch("/lessons/:id", (req, res) => {});

module.exports = router;
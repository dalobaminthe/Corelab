import { Router } from 'express'
const router = Router()

// POST /api/auth/register
router.post("/register", (req, res) => {});

// POST /api/auth/login
router.post("/login", (req, res) => {});

// POST /api/auth/set-password
router.post("/set-password", (req, res) => {});

// GET /api/auth/me
router.get("/me", (req, res) => {});

export default router
import jwt from 'jsonwebtoken'

// ─── verifyToken ─────────────────────────────────────────────────────────────
// Middleware de vérification JWT — à brancher sur toutes les routes protégées.
//
// Fonctionnement :
//   1. Lit le header Authorization: Bearer <token>
//   2. Vérifie la signature et l'expiration avec process.env.JWT_SECRET
//   3. Injecte le payload décodé dans req.user : { userId, role }
//   4. Appelle next() si tout est valide
//
// Erreurs retournées :
//   401 { error: "No token provided" }    — header absent ou malformé
//   401 { error: "Invalid token" }        — signature invalide ou expiré
const verifyToken = (req, res, next) => {};

// ─── requireAdmin ─────────────────────────────────────────────────────────────
// Middleware de contrôle de rôle — à brancher après verifyToken.
// Réserve l'accès aux utilisateurs dont req.user.role === 'admin'.
//
// Erreurs retournées :
//   403 { error: "Admin access required" }
const requireAdmin = (req, res, next) => {};

// ─── requireStudent ───────────────────────────────────────────────────────────
// Middleware de contrôle de rôle — à brancher après verifyToken.
// Réserve l'accès aux utilisateurs dont req.user.role === 'student'.
//
// Erreurs retournées :
//   403 { error: "Student access required" }
const requireStudent = (req, res, next) => {};

export { verifyToken, requireAdmin, requireStudent }
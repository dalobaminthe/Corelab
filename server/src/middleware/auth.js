import jwt from 'jsonwebtoken'

// ─── verifyToken  / requireAuth (pour matcher autres fichiers) ───────────────────────────────────────────────────────
// Middleware de vérification JWT — à brancher sur toutes les routes protégées.
const verifyToken = (req, res, next) => { // req, res, next : signature standard des middlewares Express
    const authHeader = req.headers.authorization // authorization = bearer <token>

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' }) // header absent ou malformé
    }

    const token = authHeader.split(' ')[1] // extrait le token après "Bearer "

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) // vérifie signature et expiration
        req.user = { userId: decoded.userId, role: decoded.role } // injecte le payload décodé dans req.user
        next() // token valide, on continue
    } catch {
        return res.status(401).json({ error: 'Invalid token' }) // invalide ou expiré
    }
}

// ─── requireAdmin ─────────────────────────────────────────────────────────────
// Middleware de contrôle de rôle — à brancher après verifyToken.
const requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') { // vérifie que req.user existe et que son rôle (===) est admin  
        return res.status(403).json({ error: 'Admin access required' }) // rôle insuffisant
    }
    next() // rôle admin, on continue
};

// ─── requireStudent ───────────────────────────────────────────────────────────
// Middleware de contrôle de rôle — à brancher après verifyToken.
// Réserve l'accès aux utilisateurs dont req.user.role === 'student'.
//
// Erreurs retournées :
//   403 { error: "Student access required" }
const requireStudent = (req, res, next) => {};

export { verifyToken, requireAdmin, requireStudent }
// ─── errorHandler ─────────────────────────────────────────────────────────────
// Middleware de gestion globale des erreurs Express.
// Doit être branché EN DERNIER dans index.js, après tous les routers :
//   app.use(errorHandler)
//
// Express reconnaît un error handler à sa signature à 4 arguments (err, req, res, next).
//
// Fonctionnement :
//   1. Logue l'erreur en console (stack en développement uniquement)
//   2. Lit err.statusCode si défini par le code appelant, sinon 500
//   3. Retourne une réponse JSON uniforme :
//      { error: err.message || "Internal server error" }
//
// Utilisation depuis une route :
//   const err = new Error("Not found");
//   err.statusCode = 404;
//   return next(err);
//
// Erreurs Mongoose gérées spécifiquement :
//   - CastError (ObjectId invalide)  → 400 "Invalid id"
//   - ValidationError                → 400 avec message Mongoose
//   - code 11000 (duplicate key)     → 409 "Already exists"
const errorHandler = (err, req, res, next) => {};

export default errorHandler
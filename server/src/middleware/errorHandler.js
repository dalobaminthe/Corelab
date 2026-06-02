// ─── errorHandler ─────────────────────────────────────────────────────────────
// Middleware de gestion globale des erreurs Express.
// Brancher EN DERNIER dans index.js, après tous les routers : app.use(errorHandler)


//
// Utilisation depuis une route :
//   const err = new Error("Not found")
//   err.statusCode = 404
//   return next(err)
const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack)
  }

  // ObjectId invalide
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid id' })
  }

  // Validation Mongoose
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message })
  }

  // Clé dupliquée (ex: email déjà utilisé)
  if (err.code === 11000) {
    return res.status(409).json({ error: 'Already exists' })
  }

  const status = err.statusCode || 500
  res.status(status).json({ error: err.message || 'Internal server error' })
}

export default errorHandler
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
dotenv.config()
import router from './routes/index.js'
import errorHandler from './middleware/errorHandler.js'

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api', router)

// Doit rester après tous les routers
app.use(errorHandler)

app.get('/health', (req, res) => res.json({ status: 'ok' }))

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err))

app.listen(4242, () => console.log('Server running on port 4242'))
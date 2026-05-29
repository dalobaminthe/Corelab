import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import lessonRouter from './routes/lesson.routes.js'

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api/lessons', lessonRouter)

app.get('/health', (req, res) => res.json({ status: 'ok' }))

app.listen(4242, () => console.log('Server running on port 4242'))
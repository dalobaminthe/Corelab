import express from 'express'
import cors from 'cors'
import router from './routes/index.js'
import errorHandler from './middleware/errorHandler.js'

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api', router)
app.use(errorHandler)

app.get('/health', (req, res) => res.json({ status: 'ok' }))

export default app
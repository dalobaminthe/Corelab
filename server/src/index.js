import dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose'
import app from './app.js'

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err))

app.listen(4242, () => console.log('Server running on port 4242'))
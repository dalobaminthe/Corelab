import mongoose from 'mongoose'

const lessonSchema = new mongoose.Schema({
    title: {
        type: String, required: true 
    },
    content: {
        type: String, required: true // HTML import
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true 
    },
    availableFrom: {
        type: Date, default: Date.now 
    },
    createdAt: {
        type: Date, default: Date.now 
    },
    updatedAt: {
        type: Date, default: Date.now 
    },
})

export default mongoose.model('Lesson', lessonSchema)
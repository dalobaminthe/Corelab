import cron from 'node-cron'
import Lesson from '../models/Lesson.js'
import User from '../models/User.js'
import Notification from '../models/Notification.js'

export function startNotificationJob() {
    //toutes les minutes
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date()
            // leçons disponibles depuis moins de 2 minutes pour éviter de renotifier à chaque tick
            const twoMinutesAgo = new Date (now- 2 * 60 * 1000)
            const newLessons = await Lesson.find({
                availableFrom: {$gte: twoMinutesAgo, $lte: now }
            })

            if (newLessons.length === 0) return

            for (const lesson of newLessons){
                // on cherche les étudiants qui ont accès à ce cours
                const students = await User.find({
                    role: 'student',
                    courses: lesson.courseId
                })
                
                for (const student of students) {
                    //verif qu'on a pas déjà eu une notif
                    const exists = await Notification.findOne({
                        student: student._id,
                        lesson: lesson._id,
                        type: 'lesson'
                    })

                    if (!exists) {
                        await Notification.create({
                            student: student._id,
                            lesson: lesson._id,
                            message: `Nouvelle leçon disponible : ${lesson.title}`,
                            type: 'lesson',
                            read: false,
                        })
                        console.log(`Notification créée pour ${student.email} — leçon : ${lesson.title}`)
                    }
                }
            }
        } catch (err) {
            console.error('Erreur notification job:', err.message)
        }
    })
    console.log('Notification job lancé')
}

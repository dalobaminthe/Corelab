import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    message: {
      type: String,
      default: "",
    },
    // false = non lue, true = lue (marquée par l'étudiant)
    read: {
      type: Boolean,
      default: false,
    },
    // Distingue les notifs de mise à dispo de leçon vs résultat de quiz
    type: {
      type: String,
      enum: ["lesson", "quiz"],
      default: "lesson",
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
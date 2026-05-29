const mongoose = require("mongoose");

// Sous-schéma pour chaque question du QCM
// quiz a des questions, chaque question a un prompt, des choix et les indices des bonnes réponses
const questionSchema = new mongoose.Schema(
  {
    prompt: {
      type: String,
      required: true,
    },
    // Liste des choix proposés à l'étudiant
    choices: [
      {
        type: String,
        required: true,
      },
    ],
    // Indices (base 0) des bons choix dans le tableau choices[]
    // Supporte les QCM à réponses multiples
    correctIndexes: [
      {
        type: Number,
        required: true,
      },
    ],
  },
  { _id: true }
);

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    // Score minimum (0–100) pour valider le quiz
    passingScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    questions: [questionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);
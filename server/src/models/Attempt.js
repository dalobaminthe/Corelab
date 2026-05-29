const mongoose = require("mongoose");

const attemptSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    // Réponses soumises : tableau d'indices (base 0) par question
    // answers[i] correspond à la question questions[i] du quiz
    answers: [
      {
        type: Number,
      },
    ],
    // Score calculé côté serveur lors de la soumission (0–100)
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    // true si score >= quiz.passingScore au moment de la soumission
    passed: {
      type: Boolean,
      default: false,
    },
    attemptedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attempt", attemptSchema);
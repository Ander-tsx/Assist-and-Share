import express from "express";
const router = express.Router({ mergeParams: true });

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { QuestionController } from "./question.controller.js";

// Crear preguntas en una encuesta
router.post("/", authMiddleware(["organizer"]), QuestionController.createQuestions);

// Obtener todas las preguntas de una encuesta
router.get("/", authMiddleware(), QuestionController.getQuestionsBySurvey);

// Actualizar texto u orden de una pregunta
router.patch("/:questionId", authMiddleware(["organizer"]), QuestionController.updateQuestion);

// Eliminar pregunta
router.delete("/:questionId", authMiddleware(["organizer"]), QuestionController.deleteQuestion);

export default router;

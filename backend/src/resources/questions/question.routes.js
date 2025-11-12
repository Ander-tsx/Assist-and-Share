import express from "express";
const router = express.Router({ mergeParams: true });

import { QuestionController } from "./question.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

// Crear pregunta en una encuesta
router.post("/", authMiddleware(["organizer"]), QuestionController.createQuestion);

// Obtener todas las preguntas de una encuesta
router.get("/", authMiddleware(), QuestionController.getQuestionsBySurvey);

// Actualizar texto u orden de una pregunta
router.patch("/:questionId", authMiddleware(["organizer"]), QuestionController.updateQuestion);

// Eliminar pregunta
router.delete("/:questionId", authMiddleware(["organizer"]), QuestionController.deleteQuestion);

export default router;

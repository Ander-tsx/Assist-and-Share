import express from "express";
const router = express.Router();

import { SurveyController } from "./survey.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

// Crear encuesta para un evento
router.post("/", authMiddleware(["admin"]), SurveyController.createSurvey);

// Obtener todas las encuestas
router.get("/", authMiddleware(["presenter", "admin"]), SurveyController.getAllSurveys);

// Obtener una encuesta por ID
router.get("/:eventId", authMiddleware(), SurveyController.getSurveyById);

// Actualizar encuesta (por ejemplo título, descripción o las preguntas de la encuesta)
router.patch("/:surveyId", authMiddleware(["admin"]), SurveyController.updateSurvey);

// Eliminar encuesta
router.delete("/:surveyId", authMiddleware(["admin"]), SurveyController.deleteSurvey);

export default router;

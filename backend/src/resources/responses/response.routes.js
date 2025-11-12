import express from "express";
const router = express.Router({ mergeParams: true });

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { ResponseController } from "./response.controller.js";

// Enviar respuestas (solo asistentes inscritos)
router.post("/", authMiddleware(["attendee"]), ResponseController.createResponse);

// Obtener todas las respuestas (solo organizador o admin)
router.get("/", authMiddleware(["organizer", "admin"]), ResponseController.getAllResponses);

// Obtener la respuesta del usuario actual
router.get("/me", authMiddleware(["attendee"]), ResponseController.getMyResponse);

// Actualizar una respuesta (opcional, si permites cambios)
router.patch("/:responseId", authMiddleware(["attendee"]), ResponseController.updateResponse);

// Ver resumen/estadísticas de la encuesta (promedios)
router.get("/summary", authMiddleware(["organizer", "admin"]), ResponseController.getSurveySummary);

export default router;

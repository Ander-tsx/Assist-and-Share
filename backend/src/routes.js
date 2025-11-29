import express from "express";
const router = express.Router();

// Rutas existentes
import authRoutes from "./resources/auth/auth.routes.js";
import userRoutes from "./resources/users/user.routes.js";
import eventRoutes from "./resources/events/event.routes.js";
import assistanceRoutes from "./resources/assistance/assistance.routes.js";

import surveyRoutes from "./resources/surveys/survey.routes.js";
import responseRoutes from "./resources/responses/response.routes.js";
import { getSignature } from "./utils/getSignature.js";

// Rutas del sistema
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/events", eventRoutes);
router.use("/assistance", assistanceRoutes);
router.use("/cloudinary-signature", getSignature);

router.use("/surveys/:surveyId/responses", responseRoutes);
router.use("/surveys", surveyRoutes);

export default router;

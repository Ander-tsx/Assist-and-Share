import e from "express";

const router = e.Router();

import { AuthController } from './auth.controller.js';
import passport from "passport";

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// Google OAuth routes

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { session: false }), AuthController.googleCallback);

export default router;
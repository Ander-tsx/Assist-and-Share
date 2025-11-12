import express from 'express';
const router = express.Router();

import authRoutes from './resources/auth/auth.routes.js';
import userRoutes from './resources/users/user.routes.js';
import eventRoutes from './resources/events/event.routes.js';
//import assistanceRoutes from './resources/assistance/assistance.routes.js';

import surveyRoutes from './resources/surveys/survey.routes.js';
import responseRoutes from './resources/responses/response.routes.js';


router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/events', eventRoutes);
//router.use('/assistance', assistanceRoutes);

router.use('/surveys', surveyRoutes);
router.use('/surveys/:surveyId/responses', responseRoutes);

export default router;
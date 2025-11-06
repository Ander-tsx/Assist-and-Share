import express from 'express';
const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/events', eventRoutes);
router.use('/surveys', surveyRoutes);
router.use('/assistance', assistanceRoutes);

export default router;
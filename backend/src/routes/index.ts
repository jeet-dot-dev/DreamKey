import express from 'express';
import authRoutes from './authRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import brokerInteractionRoutes from './brokerInteractionRoutes.js';
import brokerRoutes from './brokerRoutes.js';

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/upload", uploadRoutes);
// Mount interaction routes before the general broker routes to avoid path collisions
router.use("/broker/interaction", brokerInteractionRoutes);
router.use("/broker", brokerRoutes);


export default router ;
import express from 'express';
import authRoutes from './authRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import brokerRoutes from './brokerRoutes.js';

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/upload", uploadRoutes);
router.use("/broker",brokerRoutes);


export default router ;
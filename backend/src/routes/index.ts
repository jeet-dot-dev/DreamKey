import express from 'express';
import authRoutes from './authRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import brokerInteractionRoutes from './brokerInteractionRoutes.js';
import brokerRoutes from './brokerRoutes.js';
import ownerInteractionRoutes from './ownerInteractionRoutes.js';
import ownerRoutes from './ownerRoutes.js';
import propertyRoutes from './propertyRoutes.js';

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/upload", uploadRoutes);
// Mount interaction routes before the general broker routes to avoid path collisions
router.use("/broker/interaction", brokerInteractionRoutes);
router.use("/broker", brokerRoutes);
router.use("/owner/interaction", ownerInteractionRoutes);
router.use("/owner", ownerRoutes);
router.use("/property", propertyRoutes);

// Support both singular and plural forms (for frontend compatibility and direct API requirements)
router.use("/owners", ownerRoutes);
router.use("/owner-interactions", ownerInteractionRoutes);
router.use("/brokers", brokerRoutes);
router.use("/broker-interactions", brokerInteractionRoutes);
router.use("/properties", propertyRoutes);


export default router ;
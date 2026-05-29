import express from 'express';
import { listInteractions, getInteractionById, createInteraction, updateInteraction } from '../controllers/brokerInteractionController.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

// GET /broker/interaction?brokerId={id}
router.get('/', listInteractions);

// GET /broker/interaction/:id
router.get('/:id', getInteractionById);

// POST /broker/interaction
router.post('/', verifyToken, createInteraction);

// PUT /broker/interaction/:id
router.put('/:id', verifyToken, updateInteraction);

export default router;

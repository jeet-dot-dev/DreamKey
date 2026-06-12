import express from 'express';
import { listInteractions, getInteractionById, createInteraction, updateInteraction, deleteInteraction } from '../controllers/brokerInteractionController.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

// GET /broker/interaction?brokerId={id}
router.get('/', verifyToken, listInteractions);

// GET /broker/interaction/:id
router.get('/:id', verifyToken, getInteractionById);

// POST /broker/interaction
router.post('/', verifyToken, createInteraction);

// PUT /broker/interaction/:id
router.put('/:id', verifyToken, updateInteraction);

// DELETE /broker/interaction/:id
router.delete('/:id', verifyToken, deleteInteraction);

export default router;

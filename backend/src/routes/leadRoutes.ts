import express from 'express';
import { createLead, getLeads, getLeadById, updateLead, deleteLead } from '../controllers/leadController.js';
import { listLeadInteractions, createLeadInteraction } from '../controllers/leadInteractionController.js';
import { createPropertyShare } from '../controllers/shareController.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

router.get("/", getLeads);
router.get("/get", getLeads);
router.get("/:id", getLeadById);
router.post("/", verifyToken, createLead);
router.patch("/:id", verifyToken, updateLead);
router.put("/:id", verifyToken, updateLead);
router.delete("/:id", verifyToken, deleteLead);

// Lead Interactions sub-resource
router.get("/:id/interactions", listLeadInteractions);
router.post("/:id/interactions", verifyToken, createLeadInteraction);

// Lead Property Share sub-resource
router.post("/:id/share", verifyToken, createPropertyShare);

export default router;

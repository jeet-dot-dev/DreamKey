import express from "express";
import { getLeadInteractionById, updateLeadInteraction, deleteLeadInteraction } from "../controllers/leadInteractionController.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

router.get("/:id", getLeadInteractionById);
router.patch("/:id", verifyToken, updateLeadInteraction);
router.delete("/:id", verifyToken, deleteLeadInteraction);

export default router;

import express from "express";
import { createInteraction, getInteractionById, listInteractions, updateInteraction, deleteInteraction } from "../controllers/ownerInteractionController.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", listInteractions);
router.get("/:id", getInteractionById);
router.post("/", verifyToken, createInteraction);
router.put("/:id", verifyToken, updateInteraction);
router.delete("/:id", verifyToken, deleteInteraction);

export default router;
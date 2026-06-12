import express from "express";
import { createInteraction, getInteractionById, listInteractions, updateInteraction, deleteInteraction } from "../controllers/ownerInteractionController.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", verifyToken, listInteractions);
router.get("/:id", verifyToken, getInteractionById);
router.post("/", verifyToken, createInteraction);
router.put("/:id", verifyToken, updateInteraction);
router.delete("/:id", verifyToken, deleteInteraction);

export default router;
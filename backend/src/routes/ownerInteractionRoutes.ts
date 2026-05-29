import express from "express";
import { createInteraction, getInteractionById, listInteractions, updateInteraction } from "../controllers/ownerInteractionController.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", listInteractions);
router.get("/:id", getInteractionById);
router.post("/", verifyToken, createInteraction);
router.put("/:id", verifyToken, updateInteraction);

export default router;
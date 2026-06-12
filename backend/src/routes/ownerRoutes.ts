import express from "express";
import { addNewOwner, getOwner, getOwnerById, updateOwner, deleteOwner } from "../controllers/ownerController.js";
import { verifyToken } from "../middlewares/auth.js";

const ownerRoutes = express.Router();

ownerRoutes.post("/add", verifyToken, addNewOwner);
ownerRoutes.get("/get", verifyToken, getOwner);
ownerRoutes.get("/:id", verifyToken, getOwnerById);
ownerRoutes.put("/:id", verifyToken, updateOwner);
ownerRoutes.delete("/:id", verifyToken, deleteOwner);

export default ownerRoutes;
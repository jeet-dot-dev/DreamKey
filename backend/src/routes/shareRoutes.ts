import express from "express";
import { getSharedProperty, generateSharedPropertyPdf } from "../controllers/shareController.js";

const router = express.Router();

router.get("/:token", getSharedProperty);
router.get("/:token/pdf", generateSharedPropertyPdf);

export default router;

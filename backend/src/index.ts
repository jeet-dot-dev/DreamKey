import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import v1Routes from "./routes/index.js";
import type { Request, Response, NextFunction } from "express";

const app = express();
const port = process.env.PORT ?? 8080;

// Get directory path (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security
app.use(helmet());

// Parse JSON
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// CORS
app.use(
  cors({
    origin: process.env.TRUSTED_ORIGIN,
    credentials: true,
  })
);

// Logging
app.use(morgan("dev"));

// Serve static files from uploads folder
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

//  Routes
app.use("/api/v1", v1Routes);
app.use("/api", v1Routes);

//Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
});

app.listen(port, () => console.log(`Server running on port ${port}`));
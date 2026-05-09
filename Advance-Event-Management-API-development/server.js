import express from "express";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import fs from "fs";
import cors from "cors";
import { connectDB } from "./config/db.js";
import Router from "./routes/routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const app = express();

const port = process.env.PORT || 4000;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

export const uploadImage = upload.single("image");

app.use("/uploads", express.static(uploadDir));

app.use(express.json());

app.use(cors({
  origin: "https://educational-project-management.netlify.app",
  credentials: true,
}));

connectDB();

app.use(Router);

app.get("/", (req, res) => {
  res.send("API working");
});

app.listen(port, () => {
  console.log(`☑️ Server started on port ${port}`);
});
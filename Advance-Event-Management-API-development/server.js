import express from "express";
import path from 'path';
import multer from "multer";
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from "cors";
import { connectDB } from "./config/db.js";
import Router from "./routes/routes.js";
import { authenticateUser } from "./middleware/authMiddleware.js";



// Fix __dirname issue in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the upload directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// App config
const app = express();
const port = 4000;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir); // Use the correct __dirname fix
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    },
});

const upload = multer({ storage: storage });

// Multer middleware for handling file uploads
export const uploadImage = upload.single('image');

// Serve static files (images, CSS, JS) from the 'uploads' folder
app.use('/uploads', express.static(uploadDir));

// Middleware
app.use(express.json());
app.use(cors());

// DB connection
connectDB();

// API Endpoints
app.use(Router)

app.get("/", (req, res) => {
    res.send("API working");
});

// Start server
app.listen(port, () => {
    console.log(`☑️  Server started on http://localhost:${port}`);
});

import express from 'express';
import { getAbout, updateAbout } from '../controllers/aboutController.js';
import { authenticateUser } from '../middleware/authMiddleware.js'; // Assuming you have this

const router = express.Router();

router.get('/about', getAbout); // Public route to fetch "About" data
router.put('/update', authenticateUser, updateAbout); // Protected route for admin

export default router;
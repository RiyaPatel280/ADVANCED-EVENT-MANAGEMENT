import express from "express";
import userModel from "../models/userModel.js"; // Ensure the correct file extension
import EventCategory from "../models/EventCategory.js"; // Added file extension for consistency
import paymentModel from "../models/paymentModel.js";
const router = express.Router();

router.get('/admin-stats', async (req, res) => {
    try {
        // Keep your existing stats counting
        const users = await userModel.countDocuments({ role: "attendee" });
        const organizers = await userModel.countDocuments({ role: "organizer" });
        const events = await EventCategory.countDocuments();

        // Get paid events data for chart, grouped by event title
        const paidEvents = await paymentModel.aggregate([
            { $match: { status: 'completed' } },
            {
                $lookup: {
                    from: 'eventcategories', // Adjust this based on your actual collection name
                    localField: 'eventId',
                    foreignField: '_id',
                    as: 'event'
                }
            },
            { $unwind: '$event' },
            {
                $group: {
                    _id: '$event.title', // Group by event title instead of eventId
                    totalBookings: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            },
            {
                $project: {
                    name: '$_id', // Use the title as name
                    count: '$totalBookings',
                    amount: '$totalAmount'
                }
            }
        ]);

        // Calculate total bookings for percentage
        const totalBookings = paidEvents.reduce((sum, event) => sum + event.count, 0);

        // Format chart data with percentages
        const chartData = paidEvents.map(event => ({
            name: event.name,
            count: event.count,
            amount: event.amount / 100, // Convert paise to rupees
            percentage: totalBookings > 0 ? Number(((event.count / totalBookings) * 100).toFixed(1)) : 0
        }));

        res.json({
            stats: { users, organizers, events },
            chartData
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

export default router;

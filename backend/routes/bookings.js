import express from 'express';
import Booking from '../models/Booking.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all bookings for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('hotelId')
      .populate('flightId')
      .populate('packageId')
      .populate('tripId')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single booking
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('hotelId')
      .populate('flightId')
      .populate('packageId')
      .populate('tripId');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new booking
router.post('/', authMiddleware, async (req, res) => {
  try {
    const bookingReference = `BK${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const booking = await Booking.create({
      ...req.body,
      userId: req.user._id,
      bookingReference
    });
    
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update booking
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Cancel booking
router.post('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: { status: 'cancelled' } },
      { new: true }
    );
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

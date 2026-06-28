import express from 'express';
import Flight from '../models/Flight.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Search flights
router.get('/', async (req, res) => {
  try {
    const { from, to, date, stops } = req.query;
    const query = {};

    if (from) {
      query['departure.city'] = new RegExp(from, 'i');
    }
    if (to) {
      query['arrival.city'] = new RegExp(to, 'i');
    }
    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query['departure.time'] = {
        $gte: searchDate,
        $lt: nextDay
      };
    }
    if (stops !== undefined) {
      query.stops = Number(stops);
    }

    const flights = await Flight.find(query).sort({ 'departure.time': 1 });
    res.json(flights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single flight
router.get('/:id', async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    res.json(flight);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create flight
router.post('/', authMiddleware, async (req, res) => {
  try {
    const flight = await Flight.create(req.body);
    res.status(201).json(flight);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update flight
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const flight = await Flight.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    res.json(flight);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete flight
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const flight = await Flight.findByIdAndDelete(req.params.id);
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    res.json({ message: 'Flight deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

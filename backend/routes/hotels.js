import express from 'express';
import Hotel from '../models/Hotel.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all hotels
router.get('/', async (req, res) => {
  try {
    const { city, minPrice, maxPrice, rating } = req.query;
    const query = { availability: true };

    if (city) {
      query['location.city'] = new RegExp(city, 'i');
    }
    if (minPrice || maxPrice) {
      query['price.perNight'] = {};
      if (minPrice) query['price.perNight'].$gte = Number(minPrice);
      if (maxPrice) query['price.perNight'].$lte = Number(maxPrice);
    }
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    const hotels = await Hotel.find(query).sort({ rating: -1 });
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single hotel
router.get('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    res.json(hotel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create hotel (admin only - for now anyone authenticated)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const hotel = await Hotel.create(req.body);
    res.status(201).json(hotel);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update hotel
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    res.json(hotel);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete hotel
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    res.json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

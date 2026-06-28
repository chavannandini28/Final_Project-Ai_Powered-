import express from 'express';
import Package from '../models/Package.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all packages
router.get('/', async (req, res) => {
  try {
    const { destination, minPrice, maxPrice, duration } = req.query;
    const query = { availability: true };

    if (destination) {
      query.destination = new RegExp(destination, 'i');
    }
    if (minPrice || maxPrice) {
      query['price.amount'] = {};
      if (minPrice) query['price.amount'].$gte = Number(minPrice);
      if (maxPrice) query['price.amount'].$lte = Number(maxPrice);
    }
    if (duration) {
      query['duration.days'] = Number(duration);
    }

    const packages = await Package.find(query).sort({ rating: -1 });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single package
router.get('/:id', async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }
    res.json(pkg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create package
router.post('/', authMiddleware, async (req, res) => {
  try {
    const pkg = await Package.create(req.body);
    res.status(201).json(pkg);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update package
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const pkg = await Package.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }
    res.json(pkg);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete package
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const pkg = await Package.findByIdAndDelete(req.params.id);
    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }
    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

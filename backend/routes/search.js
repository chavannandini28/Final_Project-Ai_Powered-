import express from 'express';
import scraperService from '../services/scraperService.js';

const router = express.Router();

/**
 * Search Hotels - REAL-TIME ONLY
 * GET /api/search/hotels?city=Mumbai&checkIn=2025-01-15&checkOut=2025-01-20
 */
router.get('/hotels', async (req, res) => {
  try {
    const { city, checkIn, checkOut, adults = 2 } = req.query;

    if (!city) {
      return res.status(400).json({ success: false, message: 'City parameter is required' });
    }

    // Fetch ONLY real-time data
    const hotels = await scraperService.searchHotels({ city, checkIn, checkOut, adults });
    console.log(`✅ Scraped ${hotels.length} hotels for ${city}`);

    res.json({
      success: true,
      count: hotels.length,
      hotels: hotels,
      source: 'real-time'
    });

  } catch (error) {
    console.error('❌ Hotel search error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch real-time hotels. ' + error.message,
      error: error.message
    });
  }
});

/**
 * Search Flights - REAL-TIME ONLY
 * GET /api/search/flights?from=Delhi&to=Mumbai&departDate=2025-01-15&returnDate=2025-01-20
 */
router.get('/flights', async (req, res) => {
  try {
    const { from, to, departDate, returnDate } = req.query;

    if (!from || !to || !departDate) {
      return res.status(400).json({ success: false, message: 'from, to, and departDate parameters are required' });
    }

    // Fetch ONLY real-time data
    const flights = await scraperService.searchFlights({ from, to, departDate, returnDate });
    console.log(`✅ Scraped ${flights.length} flights for ${from} to ${to}`);

    res.json({
      success: true,
      count: flights.length,
      flights: flights,
      source: 'real-time'
    });

  } catch (error) {
    console.error('❌ Flight search error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch real-time flights. ' + error.message,
      error: error.message
    });
  }
});

/**
 * Search Buses - REAL-TIME ONLY
 * GET /api/search/buses?from=Mumbai&to=Pune&date=2025-01-15
 */
router.get('/buses', async (req, res) => {
  try {
    const { from, to, date } = req.query;

    if (!from || !to || !date) {
      return res.status(400).json({ success: false, message: 'from, to, and date parameters are required' });
    }

    // Fetch ONLY real-time data
    const buses = await scraperService.searchBuses({ from, to, date });
    console.log(`✅ Scraped ${buses.length} buses for ${from} to ${to}`);

    res.json({
      success: true,
      count: buses.length,
      buses: buses,
      source: 'real-time'
    });

  } catch (error) {
    console.error('❌ Bus search error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch real-time buses. ' + error.message,
      error: error.message
    });
  }
});

/**
 * Search Trains - REAL-TIME ONLY
 * GET /api/search/trains?from=Mumbai&to=Delhi&date=2025-01-15
 */
router.get('/trains', async (req, res) => {
  try {
    const { from, to, date } = req.query;

    if (!from || !to || !date) {
      return res.status(400).json({ success: false, message: 'from, to, and date parameters are required' });
    }

    // Fetch ONLY real-time data
    const trains = await scraperService.searchTrains({ from, to, date });
    console.log(`✅ Scraped ${trains.length} trains for ${from} to ${to}`);

    res.json({
      success: true,
      count: trains.length,
      trains: trains,
      source: 'real-time'
    });

  } catch (error) {
    console.error('❌ Train search error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch real-time trains. ' + error.message,
      error: error.message
    });
  }
});

export default router;

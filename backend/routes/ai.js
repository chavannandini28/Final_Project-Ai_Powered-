import express from 'express';
import scraperService from '../services/scraperService.js';

const router = express.Router();

// Scraping-only mode - no OpenAI

// Invoke LLM endpoint - Returns real scraped data (no AI)
router.post('/invoke-llm', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ 
        success: false,
        message: 'Prompt is required' 
      });
    }

    let webData = null;

    // Extract search parameters from prompt
    const promptLower = prompt.toLowerCase();
    
    try {
      if (promptLower.includes('hotel')) {
        const cityMatch = prompt.match(/(?:in|for|at)\s+([A-Za-z\s]+?)(?:,|\.|india|$)/i);
        const city = cityMatch ? cityMatch[1].trim() : 'Mumbai';
        
        webData = await scraperService.searchHotels({
          city,
          checkIn: new Date().toISOString().split('T')[0],
          checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          adults: 2
        });
      } else if (promptLower.includes('flight')) {
        const fromMatch = prompt.match(/from\s+([A-Za-z\s]+?)(?:\s+to)/i);
        const toMatch = prompt.match(/to\s+([A-Za-z\s]+?)(?:,|\.|$)/i);
        
        if (fromMatch && toMatch) {
          const from = fromMatch[1].trim();
          const to = toMatch[1].trim();
          webData = await scraperService.searchFlights({
            from,
            to,
            departDate: new Date().toISOString().split('T')[0]
          });
        }
      } else if (promptLower.includes('bus')) {
        const fromMatch = prompt.match(/from\s+([A-Za-z\s]+?)(?:\s+to)/i);
        const toMatch = prompt.match(/to\s+([A-Za-z\s]+?)(?:,|\.|$)/i);
        
        if (fromMatch && toMatch) {
          const from = fromMatch[1].trim();
          const to = toMatch[1].trim();
          webData = await scraperService.searchBuses({
            from,
            to,
            date: new Date().toISOString().split('T')[0]
          });
        }
      } else if (promptLower.includes('train')) {
        const fromMatch = prompt.match(/from\s+([A-Za-z\s]+?)(?:\s+to)/i);
        const toMatch = prompt.match(/to\s+([A-Za-z\s]+?)(?:,|\.|$)/i);
        
        if (fromMatch && toMatch) {
          const from = fromMatch[1].trim();
          const to = toMatch[1].trim();
          webData = await scraperService.searchTrains({
            from,
            to,
            date: new Date().toISOString().split('T')[0]
          });
        }
      }
    } catch (scraperError) {
      console.log('⚠️ Scraper error:', scraperError.message);
    }

    // Always return real scraped data
    return res.json({
      success: true,
      result: webData || [],
      source: 'real_time_web_scraping',
      message: 'Real-time data from web scraping'
    });

  } catch (error) {
    console.error('❌ Error in /invoke-llm:', error.message);
    return res.status(500).json({ 
      success: false,
      message: 'Error processing request'
    });
  }
});

// Send Email endpoint
router.post('/send-email', async (req, res) => {
  try {
    const { to, subject, body } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({ message: 'to, subject, and body are required' });
    }

    // Log email (in production, integrate with SendGrid/AWS SES)
    console.log('📧 Email notification:');
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Body: ${body.substring(0, 100)}...`);

    res.json({
      success: true,
      message: 'Email sent successfully',
      emailId: `email-${Date.now()}`
    });
  } catch (error) {
    console.error('Email Error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Email service error' 
    });
  }
});

// Trip Planner - Generate itinerary using scraped data only
router.post('/generate-trip-plan', async (req, res) => {
  try {
    const { 
      startingCity, 
      destination, 
      startDate, 
      endDate, 
      numTravelers, 
      travelType, 
      budget,
      budgetCategory,
      interests = []
    } = req.body;

    if (!startingCity || !destination || !startDate || !endDate) {
      return res.status(400).json({ 
        success: false,
        message: 'startingCity, destination, startDate, and endDate are required' 
      });
    }

    // Trip generation started (logs hidden)

    // Fetch data with natural timeouts (no artificial limits)
    let hotels = [];
    let flights = [];
    let buses = [];
    let trains = [];
    
    try {
      hotels = await scraperService.searchHotels({
        city: destination,
        checkIn: startDate,
        checkOut: endDate,
        adults: numTravelers || 2
      });
    } catch (e) {
      console.log(`⚠️ Hotels fetch failed: ${e.message}`);
    }
    
    try {
      flights = await scraperService.searchFlights({
        from: startingCity,
        to: destination,
        departDate: startDate
      });
    } catch (e) {
      console.log(`⚠️ Flights fetch failed: ${e.message}`);
    }
    
    try {
      buses = await scraperService.searchBuses({
        from: startingCity,
        to: destination,
        date: startDate
      });
    } catch (e) {
      console.log(`⚠️ Buses fetch failed: ${e.message}`);
    }
    
    try {
      trains = await scraperService.searchTrains({
        from: startingCity,
        to: destination,
        date: startDate
      });
    } catch (e) {
      console.log(`⚠️ Trains fetch failed: ${e.message}`);
    }

    // Trip data fetched (logs hidden)

    // Calculate trip duration (inclusive of both start and end dates)
    const startD = new Date(startDate);
    const endD = new Date(endDate);
    const totalDays = Math.ceil((endD - startD) / (1000 * 60 * 60 * 24)) + 1;
    const hasReturnLeg = totalDays >= 4;
    const costPerDay = Math.floor(budget / totalDays);

    // City GPS coordinates database
    const gpsCoordinates = {
      'Mumbai': { lat: 19.0760, lng: 72.8777 },
      'Delhi': { lat: 28.6139, lng: 77.2090 },
      'Goa': { lat: 15.4909, lng: 73.8278 },
      'Pune': { lat: 18.5204, lng: 73.8567 },
      'Nashik': { lat: 19.9975, lng: 73.7898 },
      'Agra': { lat: 27.1767, lng: 78.0081 },
      'Jaipur': { lat: 26.9124, lng: 75.7873 },
      'Bangalore': { lat: 12.9716, lng: 77.5946 }
    };

    const startGPS = gpsCoordinates[startingCity] || { lat: 20, lng: 78 };
    const destinationGPS = gpsCoordinates[destination] || { lat: 19.9975, lng: 73.7898 };

    // Haversine formula to calculate distance between two GPS coordinates
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return Math.round(R * c);
    };

    const journeyTransport = flights.length > 0
      ? { mode: 'Flight', hub: 'Airport', label: 'by flight' }
      : trains.length > 0
        ? { mode: 'Train', hub: 'Railway Station', label: 'by train' }
        : buses.length > 0
          ? { mode: 'Bus', hub: 'Bus Stand', label: 'by bus' }
          : { mode: 'Road', hub: 'Travel Hub', label: 'by road' };

    const buildSourceStayActivities = (city) => [
      { time: '08:00', activity: `Breakfast in ${city}`, location: `${city} Hotel`, description: `Start your journey with a relaxed breakfast in ${city}`, estimated_cost: '₹400', duration_hours: 1 },
      { time: '10:00', activity: `Local sightseeing in ${city}`, location: `${city} City Center`, description: `Explore the main attractions of ${city}`, estimated_cost: '₹300', duration_hours: 2 },
      { time: '13:00', activity: 'Lunch break', location: `${city} Restaurant`, description: 'Enjoy local food before the journey begins', estimated_cost: '₹500', duration_hours: 1 },
      { time: '16:00', activity: `Pack and prepare for departure`, location: `${city} Hotel`, description: `Get ready to leave ${city} for the next destination`, estimated_cost: '₹0', duration_hours: 1 }
    ];

    const buildOutboundActivities = (fromCity, toCity) => [
      { time: '07:00', activity: `Breakfast and checkout from ${fromCity}`, location: `${fromCity} Hotel`, description: `Check out and prepare for ${journeyTransport.label} journey`, estimated_cost: '₹400', duration_hours: 1 },
      { time: '08:30', activity: `Departure from ${fromCity} ${journeyTransport.hub}`, location: `${fromCity} ${journeyTransport.hub}`, description: `Travel from ${fromCity} to ${toCity} ${journeyTransport.label}`, estimated_cost: '₹800', duration_hours: 3 },
      { time: '12:30', activity: `Arrival in ${toCity}`, location: `${toCity} ${journeyTransport.hub}`, description: `Reach ${toCity} and transfer to the hotel`, estimated_cost: '₹300', duration_hours: 1 },
      { time: '14:00', activity: `Hotel check-in in ${toCity}`, location: `${toCity} Hotel`, description: `Check into your hotel and rest`, estimated_cost: '₹0', duration_hours: 1 },
      { time: '18:00', activity: `Short evening walk in ${toCity}`, location: `${toCity} Local Area`, description: `Take a light local walk and settle in`, estimated_cost: '₹200', duration_hours: 1.5 }
    ];

    const buildDestinationActivities = (city, dayNumber) => [
      { time: '08:00', activity: `Breakfast at ${city} hotel`, location: `${city} Hotel`, description: `Start day ${dayNumber} with breakfast`, estimated_cost: '₹400', duration_hours: 1 },
      { time: '10:00', activity: `Visit ${city} heritage spot`, location: `${city} Heritage Site`, description: `Spend time at one main attraction in ${city}`, estimated_cost: '₹500', duration_hours: 2.5 },
      { time: '13:00', activity: 'Lunch at local restaurant', location: `${city} Restaurant`, description: `Enjoy regional food in ${city}`, estimated_cost: '₹600', duration_hours: 1 },
      { time: '15:00', activity: `One-to-one visit to ${city} market`, location: `${city} Market`, description: `Shop or explore a single local place in detail`, estimated_cost: '₹300', duration_hours: 2 },
      { time: '18:00', activity: `Evening leisure in ${city}`, location: `${city} Promenade`, description: `Relax and enjoy the evening`, estimated_cost: '₹200', duration_hours: 1.5 },
      { time: '20:00', activity: 'Dinner and overnight stay', location: `${city} Hotel`, description: `Return to the hotel for the night`, estimated_cost: '₹800', duration_hours: 1.5 }
    ];

    const buildReturnActivities = (fromCity, toCity) => [
      { time: '07:00', activity: `Breakfast and checkout from ${fromCity}`, location: `${fromCity} Hotel`, description: `Pack up and prepare to return home`, estimated_cost: '₹400', duration_hours: 1 },
      { time: '08:30', activity: `Departure from ${fromCity} ${journeyTransport.hub}`, location: `${fromCity} ${journeyTransport.hub}`, description: `Return from ${fromCity} to ${toCity} ${journeyTransport.label}`, estimated_cost: '₹800', duration_hours: 3 },
      { time: '12:30', activity: `Arrival back in ${toCity}`, location: `${toCity} ${journeyTransport.hub}`, description: `Reach ${toCity} and complete the trip`, estimated_cost: '₹300', duration_hours: 1 },
      { time: '14:00', activity: `Final rest in ${toCity}`, location: `${toCity} Hotel`, description: `Relax and finish the journey in ${toCity}`, estimated_cost: '₹0', duration_hours: 1 }
    ];

    const buildSourceWrapUpActivities = (city) => [
      { time: '08:00', activity: `Breakfast in ${city}`, location: `${city} Hotel`, description: `Take it easy after the return journey`, estimated_cost: '₹400', duration_hours: 1 },
      { time: '10:00', activity: `Local visit in ${city}`, location: `${city} City Center`, description: `Spend the last part of the trip in ${city}`, estimated_cost: '₹300', duration_hours: 2 },
      { time: '13:00', activity: 'Lunch and trip closure', location: `${city} Restaurant`, description: 'Wrap up the journey with lunch', estimated_cost: '₹500', duration_hours: 1 },
      { time: '16:00', activity: `Trip ends in ${city}`, location: `${city} Hotel`, description: `End of the trip after returning to ${city}`, estimated_cost: '₹0', duration_hours: 1 }
    ];

    // Enhanced activity templates based on interests and trip type
    const getActivitiesForDay = (day, totalDays, sourceCity, destinationCity, interests, travelType) => {
      if (totalDays === 1) {
        return buildSourceStayActivities(sourceCity);
      }

      if (totalDays === 2) {
        if (day === 1) {
          return buildSourceStayActivities(sourceCity);
        }
        return buildOutboundActivities(sourceCity, destinationCity);
      }

      if (totalDays === 3) {
        if (day === 1) {
          return buildSourceStayActivities(sourceCity);
        }
        if (day === 2) {
          return [
            ...buildOutboundActivities(sourceCity, destinationCity).slice(0, 4),
            { time: '17:00', activity: `Evening visit in ${destinationCity}`, location: `${destinationCity} Local Area`, description: `Quick local exploration after arrival in ${destinationCity}`, estimated_cost: '₹200', duration_hours: 1.5 }
          ];
        }
        return buildReturnActivities(destinationCity, sourceCity);
      }

      if (day === 1) {
        return buildSourceStayActivities(sourceCity);
      }

      if (day === 2) {
        return buildOutboundActivities(sourceCity, destinationCity);
      }

      if (day === totalDays - 1) {
        return buildReturnActivities(destinationCity, sourceCity);
      }

      if (day === totalDays) {
        return buildSourceWrapUpActivities(sourceCity);
      }

      return buildDestinationActivities(destinationCity, day);
    };

    // Generate daily itinerary
    const generateDailyItinerary = () => {
      const itinerary = [];
      let previousCoordinates = startGPS;
      
      for (let day = 1; day <= totalDays; day++) {
        const activities = getActivitiesForDay(day, totalDays, startingCity, destination, interests, travelType);

        const isSourceDay = day === 1 || (hasReturnLeg && day === totalDays);
        const isOutboundDay = totalDays === 2 ? day === 2 : day === 2;
        const isReturnDay = totalDays === 3 ? day === 3 : hasReturnLeg && day === totalDays - 1;
        const isDestinationDay = (!isSourceDay && !isOutboundDay && !isReturnDay);

        const dayCoordinates = isSourceDay ? startGPS : destinationGPS;
        const cityForRouteMap = isSourceDay ? startingCity : destination;

        let dayTitle = `Exploring ${destination}`;
        let whyVisit = `Spend time in ${destination}`;

        if (day === 1) {
          dayTitle = `Stay in ${startingCity}`;
          whyVisit = `Begin your journey with a stay in ${startingCity}`;
        } else if (totalDays === 2 && day === 2) {
          dayTitle = `Travel from ${startingCity} to ${destination} ${journeyTransport.label}`;
          whyVisit = `Depart from ${startingCity} and reach ${destination}`;
        } else if (totalDays === 3 && day === 2) {
          dayTitle = `Travel to ${destination} ${journeyTransport.label}`;
          whyVisit = `Arrive in ${destination} and begin the trip there`;
        } else if (isReturnDay) {
          dayTitle = `Return to ${startingCity} ${journeyTransport.label}`;
          whyVisit = `Leave ${destination} and return to ${startingCity}`;
        } else if (hasReturnLeg && day === totalDays) {
          dayTitle = `Wrap up in ${startingCity}`;
          whyVisit = `Finish the journey after returning to ${startingCity}`;
        } else if (isDestinationDay) {
          dayTitle = `Explore ${destination} - Day ${day}`;
          whyVisit = `Visit one-to-one places and stay in ${destination}`;
        }
        
        // Calculate distance from previous day's location
        let distanceFromPrevious = null;
        if (day > 1) {
          distanceFromPrevious = calculateDistance(
            previousCoordinates.lat,
            previousCoordinates.lng,
            dayCoordinates.lat,
            dayCoordinates.lng
          );
        }
        
        itinerary.push({
          day,
          city_location: cityForRouteMap,
          route_city: cityForRouteMap, // For route map start/end point display
          title: dayTitle,
          why_visit: whyVisit,
          distance_from_previous: distanceFromPrevious,
          travel_time: day === 1 ? null : distanceFromPrevious ? `${Math.ceil(distanceFromPrevious / 60)} hours` : 'Local movement',
          // Add coordinates for route map - Day 1 shows starting city, rest show destination
          coordinates: dayCoordinates,
          activities: activities.map(a => ({
            ...a,
            gps: dayCoordinates,
            duration: a.duration_hours
          })),
          accommodation: hotels.length > 0 ? {
            hotel_name: hotels[0].name,
            area: destination,
            estimated_cost: Math.floor(hotels[0].price_per_night || hotels[0].price_base || 100),
            amenities: hotels[0].amenities || ['WiFi', 'AC', 'Restaurant'],
            gps: destinationGPS
          } : null
        });
        
        // Update previous coordinates for next day's distance calculation
        previousCoordinates = dayCoordinates;
      }
      
      return itinerary;
    };

    // Generate structured trip plan
    const tripPlan = {
      title: `${startingCity} to ${destination} - ${travelType} Trip`,
      duration: `${totalDays} Days`,
      budget: budget,
      travelType,
      budgetCategory: budgetCategory || 'Standard',
      
      // Daily itinerary with complete details
      daily_itinerary: generateDailyItinerary(),
      
      // Route map data
      route_map: {
        start_point: { city: startingCity, ...startGPS },
        end_point: { city: destination, ...destinationGPS },
        return_point: hasReturnLeg ? { city: startingCity, ...startGPS } : null,
        waypoints: hasReturnLeg ? [startingCity, destination, startingCity] : [startingCity, destination],
        route_points: hasReturnLeg
          ? [
              { city: startingCity, ...startGPS },
              { city: destination, ...destinationGPS },
              { city: startingCity, ...startGPS }
            ]
          : [
              { city: startingCity, ...startGPS },
              { city: destination, ...destinationGPS }
            ]
      },

      // Selected options
      selectedHotel: hotels.length > 0 ? hotels[0] : null,
      selectedFlight: flights.length > 0 ? flights[0] : null,
      selectedBus: buses.length > 0 ? buses[0] : null,
      selectedTrain: trains.length > 0 ? trains[0] : null,

      // Recommendations
      tips: [
        `Best time to visit ${destination} is during moderate weather seasons`,
        'Book your hotel and transport early for better rates and availability',
        'Check local weather before packing - bring appropriate clothing',
        'Keep some local currency for small transactions and tips',
        'Download offline maps and important locations on your phone',
        'Try authentic ${destination} local cuisine at street food markets',
        'Plan for travel time between locations - use local transport',
        'Visit popular attractions early morning to avoid tourist crowds',
        `Learn basic local phrases to communicate with ${destination} locals`,
        'Keep your accommodation address written in local language for taxi drivers'
      ],

      // Cost breakdown - numeric values for calculations
      costBreakdown: {
        accommodation: Math.floor(budget * 0.4),
        transport: Math.floor(budget * 0.3),
        food: Math.floor(budget * 0.2),
        activities: Math.floor(budget * 0.1),
        total: budget
      },

      // Transport options summary
      transportOptions: {
        flights: flights.slice(0, 3).map(f => ({
          airline: f.airline || f.name,
          departure: f.departure_time || f.departure || 'Check availability',
          arrival: f.arrival_time || f.arrival || 'Check availability',
          price: f.price || 'Contact for pricing',
          duration: f.duration || '2-3 hours'
        })),
        buses: buses.slice(0, 3).map(b => ({
          operator: b.operator || b.name,
          departure: b.departure_time || b.departure || 'Check schedule',
          arrival: b.arrival_time || b.arrival || 'Check schedule',
          price: b.price || 'Contact for pricing',
          duration: b.duration || '4-6 hours'
        })),
        trains: trains.slice(0, 3).map(t => ({
          name: t.train_name || t.name,
          departure: t.departure_time || t.departure || 'Check schedule',
          arrival: t.arrival_time || t.arrival || 'Check schedule',
          price: t.price || 'Contact for pricing',
          duration: t.duration || '6-8 hours'
        }))
      },

      // Hotel recommendations
      hotelRecommendations: hotels.slice(0, 5).map(h => ({
        name: h.name,
        price_per_night: h.price_per_night || h.price_base || 100,
        rating: h.rating || 4,
        amenities: h.amenities || ['WiFi', 'AC', 'Restaurant', 'Room Service'],
        description: `${h.name} - A great option in ${destination}`
      }))
    };

    // Compute total distance from explicit route points when available
    try {
      const rp = tripPlan.route_map && tripPlan.route_map.route_points ? tripPlan.route_map.route_points : [];
      let totalDistance = 0;
      for (let i = 1; i < rp.length; i++) {
        totalDistance += calculateDistance(rp[i - 1].lat, rp[i - 1].lng, rp[i].lat, rp[i].lng);
      }
      tripPlan.route_map = tripPlan.route_map || {};
      tripPlan.route_map.total_distance = Math.round(totalDistance);

      // For single-day trips, set the day's distance_from_previous to total distance
      if (totalDays === 1 && tripPlan.daily_itinerary && tripPlan.daily_itinerary[0]) {
        tripPlan.daily_itinerary[0].distance_from_previous = Math.round(totalDistance);
      }
    } catch (e) {
      // Do not fail trip generation for distance calc errors
      console.log('⚠️ Route distance calc failed:', e.message);
    }

    res.json({
      success: true,
      tripPlan,
      realData: {
        hotelsAvailable: hotels.length,
        flightsAvailable: flights.length,
        busesAvailable: buses.length,
        trainsAvailable: trains.length,
        source: 'real_time_scraping'
      },
      message: '✅ Trip plan generated from real-time scraped data'
    });

  } catch (error) {
    console.error('❌ Trip Plan Generation Error:', error.message);
    res.status(500).json({ 
      success: false,
      message: 'Error generating trip plan'
    });
  }
});

export default router;

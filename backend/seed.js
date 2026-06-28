import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Hotel from './models/Hotel.js';
import Package from './models/Package.js';
import Flight from './models/Flight.js';

dotenv.config();

// Sample Hotels
const hotels = [
  {
    name: "Grand Plaza Hotel",
    location: {
      city: "New York",
      country: "USA",
      address: "123 5th Avenue, New York, NY 10001",
      coordinates: { lat: 40.7589, lng: -73.9851 }
    },
    rating: 4.5,
    price: { perNight: 250, currency: "USD" },
    amenities: ["WiFi", "Pool", "Gym", "Restaurant", "Room Service"],
    images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945"],
    description: "Luxury hotel in the heart of Manhattan with stunning city views.",
    roomTypes: [
      { name: "Standard Room", price: 250, capacity: 2, amenities: ["WiFi", "TV", "AC"] },
      { name: "Deluxe Suite", price: 450, capacity: 4, amenities: ["WiFi", "TV", "AC", "Balcony"] }
    ],
    availability: true
  },
  {
    name: "Beachside Resort",
    location: {
      city: "Miami",
      country: "USA",
      address: "456 Ocean Drive, Miami Beach, FL 33139",
      coordinates: { lat: 25.7907, lng: -80.1300 }
    },
    rating: 4.8,
    price: { perNight: 350, currency: "USD" },
    amenities: ["WiFi", "Beach Access", "Spa", "Pool", "Bar", "Restaurant"],
    images: ["https://images.unsplash.com/photo-1571896349842-33c89424de2d"],
    description: "Oceanfront resort with private beach and world-class amenities.",
    roomTypes: [
      { name: "Ocean View", price: 350, capacity: 2, amenities: ["WiFi", "TV", "Ocean View"] },
      { name: "Beachfront Villa", price: 650, capacity: 6, amenities: ["WiFi", "TV", "Kitchen", "Private Pool"] }
    ],
    availability: true
  },
  {
    name: "Mountain Lodge",
    location: {
      city: "Aspen",
      country: "USA",
      address: "789 Mountain Road, Aspen, CO 81611",
      coordinates: { lat: 39.1911, lng: -106.8175 }
    },
    rating: 4.6,
    price: { perNight: 300, currency: "USD" },
    amenities: ["WiFi", "Fireplace", "Ski Storage", "Restaurant", "Hot Tub"],
    images: ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"],
    description: "Cozy mountain retreat perfect for skiing and outdoor adventures.",
    roomTypes: [
      { name: "Cabin Room", price: 300, capacity: 3, amenities: ["WiFi", "Fireplace", "Mountain View"] },
      { name: "Lodge Suite", price: 500, capacity: 5, amenities: ["WiFi", "Fireplace", "Kitchen", "Hot Tub"] }
    ],
    availability: true
  }
];

// Sample Packages
const packages = [
  {
    package_name: "European Adventure",
    name: "European Adventure",
    destination: "Europe",
    package_type: "international",
    duration: { days: 10, nights: 9 },
    duration_days: 10,
    duration_nights: 9,
    price: { amount: 2500, currency: "USD" },
    price_per_person: 2500,
    description: "Explore the best of Europe with this comprehensive tour package.",
    images: ["https://images.unsplash.com/photo-1499856871958-5b9627545d1a"],
    highlights: ["Eiffel Tower Visit", "Louvre Museum Tour", "Colosseum Experience", "Venice Gondola Ride"],
    inclusions: ["Flights", "4-Star Hotels", "Daily Breakfast", "Guided City Tours", "Travel Insurance"],
    includes: ["Flights", "Hotels", "Breakfast", "City Tours", "Travel Insurance"],
    excludes: ["Lunch", "Dinner", "Personal Expenses"],
    itinerary: [
      { day: 1, title: "Arrival in Paris", description: "Check-in and evening city tour", meals: ["Dinner"] },
      { day: 2, title: "Paris Sightseeing", description: "Eiffel Tower, Louvre Museum", meals: ["Breakfast"] },
      { day: 3, title: "Travel to Rome", description: "Flight to Rome, evening free", meals: ["Breakfast"] }
    ],
    rating: 4.7,
    reviews_count: 250,
    availability: true,
    maxTravelers: 15
  },
  {
    package_name: "Tropical Paradise",
    name: "Tropical Paradise",
    destination: "Maldives",
    package_type: "honeymoon",
    duration: { days: 7, nights: 6 },
    duration_days: 7,
    duration_nights: 6,
    price: { amount: 3500, currency: "USD" },
    price_per_person: 3500,
    description: "Relax in luxury at pristine beaches with crystal clear waters.",
    images: ["https://images.unsplash.com/photo-1514282401047-d79a71a590e8"],
    highlights: ["Private Beach Access", "Overwater Villa", "Couples Spa Treatment", "Sunset Cruise"],
    inclusions: ["Round-trip Flights", "Luxury Resort Stay", "All Meals Included", "Water Sports", "Spa Treatment"],
    includes: ["Flights", "Resort Stay", "All Meals", "Water Sports", "Spa Treatment"],
    excludes: ["Alcoholic Beverages", "Personal Expenses"],
    itinerary: [
      { day: 1, title: "Arrival", description: "Transfer to resort, welcome dinner", meals: ["Dinner"] },
      { day: 2, title: "Beach Day", description: "Free day for relaxation", meals: ["Breakfast", "Lunch", "Dinner"] }
    ],
    rating: 4.9,
    reviews_count: 180,
    availability: true,
    maxTravelers: 10
  },
  {
    package_name: "Asian Explorer",
    name: "Asian Explorer",
    destination: "Thailand & Vietnam",
    package_type: "adventure",
    duration: { days: 12, nights: 11 },
    duration_days: 12,
    duration_nights: 11,
    price: { amount: 2200, currency: "USD" },
    price_per_person: 2200,
    description: "Discover the rich culture and stunning landscapes of Southeast Asia.",
    images: ["https://images.unsplash.com/photo-1552465011-b4e21bf6e79a"],
    highlights: ["Bangkok Temples Tour", "Ha Long Bay Cruise", "Thai Cooking Class", "Vietnamese Street Food Tour"],
    inclusions: ["Round-trip Flights", "3-Star Hotels", "Daily Breakfast", "Guided Tours", "Airport Transfers"],
    includes: ["Flights", "Hotels", "Daily Breakfast", "Guided Tours", "Transfers"],
    excludes: ["Lunch", "Dinner", "Travel Insurance"],
    itinerary: [
      { day: 1, title: "Bangkok Arrival", description: "City orientation tour", meals: ["Breakfast"] },
      { day: 2, title: "Grand Palace", description: "Visit temples and royal palace", meals: ["Breakfast"] }
    ],
    rating: 4.6,
    reviews_count: 320,
    availability: true,
    maxTravelers: 20
  }
];

// Sample Flights
const flights = [
  {
    airline: "American Airlines",
    flightNumber: "AA101",
    departure: {
      airport: "JFK",
      city: "New York",
      country: "USA",
      time: new Date("2025-02-01T08:00:00")
    },
    arrival: {
      airport: "LAX",
      city: "Los Angeles",
      country: "USA",
      time: new Date("2025-02-01T11:30:00")
    },
    duration: "5h 30m",
    price: {
      economy: 250,
      business: 800,
      firstClass: 1500,
      currency: "USD"
    },
    stops: 0,
    availableSeats: {
      economy: 100,
      business: 20,
      firstClass: 10
    },
    aircraft: "Boeing 777"
  },
  {
    airline: "Delta Airlines",
    flightNumber: "DL202",
    departure: {
      airport: "ATL",
      city: "Atlanta",
      country: "USA",
      time: new Date("2025-02-05T14:00:00")
    },
    arrival: {
      airport: "LHR",
      city: "London",
      country: "UK",
      time: new Date("2025-02-06T02:30:00")
    },
    duration: "8h 30m",
    price: {
      economy: 450,
      business: 2200,
      firstClass: 4500,
      currency: "USD"
    },
    stops: 0,
    availableSeats: {
      economy: 150,
      business: 30,
      firstClass: 12
    },
    aircraft: "Airbus A350"
  },
  {
    airline: "United Airlines",
    flightNumber: "UA303",
    departure: {
      airport: "SFO",
      city: "San Francisco",
      country: "USA",
      time: new Date("2025-02-10T10:00:00")
    },
    arrival: {
      airport: "NRT",
      city: "Tokyo",
      country: "Japan",
      time: new Date("2025-02-11T14:00:00")
    },
    duration: "11h",
    price: {
      economy: 600,
      business: 3000,
      firstClass: 6000,
      currency: "USD"
    },
    stops: 0,
    availableSeats: {
      economy: 180,
      business: 40,
      firstClass: 15
    },
    aircraft: "Boeing 787 Dreamliner"
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-booker');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Hotel.deleteMany({});
    await Package.deleteMany({});
    await Flight.deleteMany({});
    console.log('✅ Existing data cleared');

    // Insert sample data
    console.log('📦 Inserting hotels...');
    await Hotel.insertMany(hotels);
    console.log(`✅ Inserted ${hotels.length} hotels`);

    console.log('📦 Inserting packages...');
    await Package.insertMany(packages);
    console.log(`✅ Inserted ${packages.length} packages`);

    console.log('📦 Inserting flights...');
    await Flight.insertMany(flights);
    console.log(`✅ Inserted ${flights.length} flights`);

    console.log('');
    console.log('🎉 Database seeded successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   - ${hotels.length} Hotels`);
    console.log(`   - ${packages.length} Travel Packages`);
    console.log(`   - ${flights.length} Flights`);
    console.log('');
    console.log('💡 You can now start the application and see the data!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

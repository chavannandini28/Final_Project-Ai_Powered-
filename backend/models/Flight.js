import mongoose from 'mongoose';

const flightSchema = new mongoose.Schema({
  airline: {
    type: String,
    required: true
  },
  flightNumber: {
    type: String,
    required: true
  },
  departure: {
    airport: String,
    city: String,
    country: String,
    time: Date
  },
  arrival: {
    airport: String,
    city: String,
    country: String,
    time: Date
  },
  duration: String,
  price: {
    economy: Number,
    business: Number,
    firstClass: Number,
    currency: { type: String, default: 'USD' }
  },
  stops: {
    type: Number,
    default: 0
  },
  availableSeats: {
    economy: Number,
    business: Number,
    firstClass: Number
  },
  aircraft: String
}, {
  timestamps: true
});

export default mongoose.model('Flight', flightSchema);

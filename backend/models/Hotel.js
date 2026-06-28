import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    city: String,
    country: String,
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  price: {
    perNight: Number,
    currency: { type: String, default: 'USD' }
  },
  amenities: [String],
  images: [String],
  description: String,
  roomTypes: [{
    name: String,
    price: Number,
    capacity: Number,
    amenities: [String]
  }],
  availability: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Hotel', hotelSchema);

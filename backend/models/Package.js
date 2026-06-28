import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  package_name: {
    type: String,
    required: true
  },
  name: {  // Alias for compatibility
    type: String
  },
  destination: {
    type: String,
    required: true
  },
  package_type: {
    type: String,
    enum: ['honeymoon', 'family', 'adventure', 'weekend', 'international', 'pilgrimage', 'beach', 'cultural'],
    default: 'international'
  },
  duration: {
    days: Number,
    nights: Number
  },
  duration_days: Number,  // Flat field for frontend
  duration_nights: Number,  // Flat field for frontend
  price: {
    amount: Number,
    currency: { type: String, default: 'USD' }
  },
  price_per_person: Number,  // Flat field for frontend
  description: String,
  images: [String],
  highlights: [String],  // Frontend uses this
  inclusions: [String],  // Frontend uses this
  includes: [String],  // Legacy field
  excludes: [String],
  reviews_count: { type: Number, default: 0 },
  itinerary: [{
    day: Number,
    title: String,
    description: String,
    meals: [String]
  }],
  rating: Number,
  availability: {
    type: Boolean,
    default: true
  },
  maxTravelers: Number
}, {
  timestamps: true
});

export default mongoose.model('Package', packageSchema);

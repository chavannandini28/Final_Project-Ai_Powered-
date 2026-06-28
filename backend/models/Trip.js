import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['planning', 'booked', 'ongoing', 'completed', 'cancelled'],
    default: 'planning'
  },
  budget: {
    total: Number,
    spent: { type: Number, default: 0 }
  },
  travelers: {
    adults: { type: Number, default: 1 },
    children: { type: Number, default: 0 }
  },
  itinerary: [{
    day: Number,
    date: Date,
    activities: [{
      time: String,
      title: String,
      description: String,
      location: String,
      cost: Number
    }]
  }],
  notes: String
}, {
  timestamps: true
});

export default mongoose.model('Trip', tripSchema);

import mongoose  from 'mongoose'

const rideSchema = new mongoose.Schema({
  passenger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Passenger',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    // required: true
  },
  pickupLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default:"Point"
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  dropoffLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default:"Point"
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  distance:{
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['requested', 'accepted', 'in-progress', 'completed', 'cancelled'],
    default: 'requested'
  },
  fare: {
    type: Number,
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  onHoldBalance:{
    type: Number,
  },
  feedback: {
    type: String,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  }
}, {
  timestamps: true
});

rideSchema.index({ pickupLocation: '2dsphere', dropoffLocation: '2dsphere' });

const Ride = mongoose.model('Ride', rideSchema);

export default Ride;

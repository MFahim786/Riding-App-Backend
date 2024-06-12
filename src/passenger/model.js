import mongoose from "mongoose"
const passengerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  preferences: {
    language: {
      type: String,
      default: 'en'
    },
    preferredDriverRating: {
      type: Number,
      default: 4.0
    }
  },
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet'
  },
  rating:{
    type: Number,
    default: 5.0
  }
}, {
  timestamps: true
});

passengerSchema.index({ location: '2dsphere' });

const Passenger = mongoose.model('Passenger', passengerSchema);

export default Passenger;

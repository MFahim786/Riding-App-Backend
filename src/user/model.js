import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
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
  role: {
    type: String,
    enum: ['driver', 'passenger'],
    required: true
  },
  vehicle: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  }],
  rating: {
    type: Number,
    default: 5.0
  },
  status: {
    type: String,
    enum: ['available', 'unavailable'],
    default: 'available'
  },
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet'
  },
  driverImage: {
    type: String,
  },
  identityCardNumber: {
    type: String,
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
  }
}, {
  timestamps: true
});

userSchema.index({ location: '2dsphere' });

const User = mongoose.model('User', userSchema);

export default User;

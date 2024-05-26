import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['driver', 'passenger'],
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: function() { return this.role === 'driver'; },
    },
    coordinates: {
      type: [Number],
      required: function() { return this.role === 'driver'; },
    },
  },
  vehicle: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
  }],
  rating: {
    type: Number,
    default: 5.0,
  },
  status: {
    type: String,
    enum: ['available', 'unavailable'],
    default: 'unavailable',
  },
  driverImage: {
    type: String, // Assuming the image URL or path is stored as a string
    required: function() { return this.role === 'driver'; },
  },
  identityCardNumber: {
    type: String,
    required: function() { return this.role === 'driver'; },
  },
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
  },
}, {
  timestamps: true,
});

userSchema.index({ location: '2dsphere' });

const User = mongoose.model('User', userSchema);

export default User;

import mongoose  from 'mongoose'

const driverSchema = new mongoose.Schema({
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
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
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
    type: String, // Assuming the image URL or path is stored as a string
    required: true
  },
  vehicleType: {
    type: String,
    required: true
  },
   identityCardNumber:{
    type: String,
    required: true,
   },
  vehicleModel: {
    type: String,
    required: true
  },
  numberPlate: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

driverSchema.index({ location: '2dsphere' });

const Driver = mongoose.model('Driver', driverSchema);

export default Driver;

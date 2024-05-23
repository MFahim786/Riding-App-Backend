import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  vehicleImage: {
    type: String,
  },
  model: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  numberPlate: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true
  },
  type: {
    type: String,
    // enum: ['Car', 'Bike', 'Truck', 'Van', 'Other'],
    required: true
  }

}, {
  timestamps: true
});

vehicleSchema.index({ currentLocation: '2dsphere' });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

export default Vehicle;

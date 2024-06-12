import mongoose from 'mongoose';

const feedbackRatingSchema = new mongoose.Schema({
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride', // Assuming you have a Ride model
    required: true,
  },
  passenger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model for passengers
    required: true,
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model for drivers
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  feedback: {
    type: String,
    required: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps
});

const FeedbackRating = mongoose.model('FeedbackRating', feedbackRatingSchema);

export default FeedbackRating;

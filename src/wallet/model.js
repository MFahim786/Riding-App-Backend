import mongoose  from "mongoose"

const walletSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'ownerModel',
    required: true
  },
  ownerModel: {
    type: String,
    required: true,
    enum: ['Passenger', 'Driver']
  },
  balance: {
    type: Number,
    required: true,
    default: 0
  },
  transactions: [{
    amount: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    description: {
      type: String
    }
  }]
}, {
  timestamps: true
});

const Wallet = mongoose.model('Wallet', walletSchema);

export default  Wallet;

import mongoose  from 'mongoose'

export const connectDB = async () => {
  try {
    const mongoURI = "mongodb+srv://s-booking-app:S-booking-app@booking-app.xb4efkw.mongodb.net";
    await mongoose.connect('mongodb+srv://s-booking-app:S-booking-app@booking-app.xb4efkw.mongodb.net');
    console.log('MongoDB connected...');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};



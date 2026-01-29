import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const uri = process.env.DATABASE_URL || process.env.MONGO_URI;
    if (!uri) {
      console.warn('DATABASE_URL / MONGO_URI not set – API data routes will fail until DB is configured.');
      return;
    }
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.warn('Server will run but categories/links API will fail until MongoDB is available.');
  }
};

export default connectDB;

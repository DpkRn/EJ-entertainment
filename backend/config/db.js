import mongoose from 'mongoose';

let connectionPromise = null;

/**
 * Returns a promise that resolves to true when connected, false if no URI or connection failed.
 * Reuses the same promise so concurrent requests wait for one connection.
 */
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return true;
  if (connectionPromise) return connectionPromise;

  connectionPromise = (async () => {
    const uri = process.env.DATABASE_URL || process.env.MONGO_URI;
    if (!uri) {
      console.warn('DATABASE_URL / MONGO_URI not set – set it in Vercel Environment Variables for production.');
      return false;
    }
    try {
      const conn = await mongoose.connect(uri);
      const host = conn?.connection?.host ?? conn?.connection?.name ?? 'MongoDB';
      console.log('MongoDB connected:', host);
      return true;
    } catch (error) {
      console.error('MongoDB connection error:', error.message);
      connectionPromise = null;
      return false;
    }
  })();

  return connectionPromise;
};

export default connectDB;

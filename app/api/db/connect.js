import mongoose from 'mongoose';

const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('DB connection failed:', error);
  }
};

export default connectDB;

import mongoose from 'mongoose';
import 'dotenv/config';

export async function connectMongo() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');
}

import mongoose from 'mongoose';

let connection;

export function connectDatabase() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    return Promise.reject(new Error('MONGO_URI is not set'));
  }
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  if (!connection) {
    mongoose.set('strictQuery', true);
    connection = mongoose.connect(uri).then(() => {
      console.log('MongoDB connected');
    }).catch((err) => {
      connection = null;
      throw err;
    });
  }
  return connection;
}

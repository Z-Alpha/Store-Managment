const mongoose = require('mongoose');
const colors = require('colors');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/store_management';
    console.log('Attempting to connect to MongoDB at:', mongoURI);

    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
    console.log(`Database Name: ${conn.connection.name}`.cyan);
    
    // List all collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));

    return conn;
  } catch (error) {
    console.error('MongoDB Connection Error:'.red.bold);
    console.error(`Error Message: ${error.message}`.red);
    console.error('Error Details:', error);
    process.exit(1);
  }
};

module.exports = connectDB; 
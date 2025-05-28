const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { errorHandler } = require('./middleware/errorMiddleware');
const connectDB = require('./config/db');
const customerRoutes = require('./routes/customerRoutes');

// Wrap the entire application in a try-catch for global error handling
try {
  // Load env vars
  const envPath = path.resolve(__dirname, '.env');
  console.log('Starting server...'.yellow.bold);
  console.log('Current directory:', __dirname);
  console.log('Looking for .env file at:', envPath);
  console.log('Directory contents:', fs.readdirSync(__dirname));

  if (!fs.existsSync(envPath)) {
    console.error('.env file not found at:', envPath.red);
    throw new Error('.env file not found - Please create one with required variables');
  }

  const envResult = dotenv.config({ path: envPath });

  if (envResult.error) {
    console.error('Error loading .env file:'.red, envResult.error);
    throw envResult.error;
  }

  // Verify environment variables
  const requiredEnvVars = ['NODE_ENV', 'PORT', 'MONGO_URI', 'JWT_SECRET'];
  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:'.red, missingEnvVars);
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }

  console.log('Environment variables loaded:'.green, {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set',
  });

  const app = express();

  // CORS Configuration
  const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://your-frontend-domain.vercel.app'] // You'll update this with your actual frontend domain
      : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    optionsSuccessStatus: 200
  };

  // Middleware
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Basic route for testing
  app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working' });
  });

  // Debug middleware
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`.cyan);
    console.log('Request Headers:', req.headers);
    next();
  });

  // Routes
  app.use('/api/users', require('./routes/userRoutes'));
  app.use('/api/products', require('./routes/productRoutes'));
  app.use('/api/orders', require('./routes/orderRoutes'));
  app.use('/api/customers', customerRoutes);

  // Error handler
  app.use(errorHandler);

  const PORT = process.env.PORT || 5001;

  // Connect to database before starting server
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
        console.log(`CORS enabled for origins: ${corsOptions.origin.join(', ')}`.cyan);
      });
    })
    .catch((error) => {
      console.error('Failed to connect to MongoDB:'.red.bold, error);
      process.exit(1);
    });

} catch (error) {
  console.error('Server initialization error:'.red.bold);
  console.error(error);
  process.exit(1);
} 
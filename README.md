# Store Management System

A full-stack web application for managing store inventory, orders, and customers.

## Features

- User Authentication & Authorization
- Product Management
- Order Processing
- Customer Management
- Inventory Tracking
- Responsive Design
- Real-time Updates

## Tech Stack

### Frontend
- React
- TypeScript
- Redux Toolkit
- Tailwind CSS
- Axios
- React Router
- React Toastify

### Backend
- Node.js
- Express
- MongoDB
- JWT Authentication
- Mongoose
- CORS

## Prerequisites

Before you begin, ensure you have installed:
- Node.js (>=14.0.0)
- npm or yarn
- MongoDB (local or Atlas connection)

## Installation

1. Clone the repository:
```bash
git clone <your-repository-url>
cd store-management-webapp
```

2. Install Backend Dependencies:
```bash
cd backend
npm install
```

3. Install Frontend Dependencies:
```bash
cd frontend
npm install
```

4. Set up environment variables:

Backend (.env):
```
NODE_ENV=development
PORT=5001
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

Frontend (.env):
```
REACT_APP_API_URL=http://localhost:5001/api
```

## Running the Application

1. Start the Backend:
```bash
cd backend
npm run dev
```

2. Start the Frontend:
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001

## API Documentation

### Authentication Endpoints
- POST /api/users/register - Register a new user
- POST /api/users/login - Login user
- GET /api/users/profile - Get user profile

### Product Endpoints
- GET /api/products - Get all products
- GET /api/products/:id - Get single product
- POST /api/products - Create product
- PUT /api/products/:id - Update product
- DELETE /api/products/:id - Delete product

### Order Endpoints
- GET /api/orders - Get all orders
- POST /api/orders - Create order
- GET /api/orders/:id - Get single order
- PUT /api/orders/:id - Update order status

### Customer Endpoints
- GET /api/customers - Get all customers
- POST /api/customers - Add customer
- PUT /api/customers/:id - Update customer
- DELETE /api/customers/:id - Delete customer

## Deployment

The application can be deployed using:
- Frontend: Vercel or Netlify
- Backend: Render or Railway
- Database: MongoDB Atlas

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details 
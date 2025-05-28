const errorHandler = (err, req, res, next) => {
  console.error('Error details:', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Handle specific error types
  if (err.message === 'JWT_SECRET is not configured') {
    return res.status(500).json({
      message: 'Server configuration error',
      error: 'Authentication service is not properly configured'
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Authentication error',
      error: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Authentication error',
      error: 'Token expired'
    });
  }

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : null,
  });
};

module.exports = { errorHandler }; 
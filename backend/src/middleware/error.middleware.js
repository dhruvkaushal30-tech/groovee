export function notFound(_req, res) {
  res.status(404).json({ message: 'Route not found' });
}

export function errorHandler(err, _req, res, _next) {
  let status = err.statusCode || 500;
  let message = err.message || 'Server error';

  if (err.code === 11000) {
    status = 409;
    const key = Object.keys(err.keyPattern || {})[0];
    if (key === 'email') message = 'Email already registered';
    else if (key === 'phone') message = 'Mobile number already registered';
    else if (key === 'slug') message = 'A record with this name already exists';
    else if (key === 'code') message = 'Coupon code already exists';
    else message = 'Duplicate value';
  }

  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid id';
  }

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors)
      .map((item) => item.message)
      .join(', ');
  }

  if (err.name === 'MulterError') {
    status = 400;
    message = err.message;
  }

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({ message });
}

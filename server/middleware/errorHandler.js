function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.isJoi) {
    return res.status(400).json({ error: err.details[0].message });
  }

  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid or missing token' });
  }

  const status = err.statusCode || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
}

module.exports = errorHandler;

// middlewares/validateMovie.js
module.exports = function validateMovie(req, res, next) {
  const { name, rating, timings, releaseType, release } = req.body;
  const isCreate = req.method === 'POST';

  // Base validations for create
  if (isCreate) {
    if (!name || !req.file || !req.file.path || !req.file.filename || !releaseType) {
      return res.status(400).json({ error: 'Missing required fields: name, poster, or releaseType.' });
    }
  } else {
    // For update, releaseType is required to apply conditional checks
    if (!releaseType) {
      return res.status(400).json({ error: 'releaseType is required for update.' });
    }
  }

  if (!['now', 'upcoming'].includes(releaseType)) {
    return res.status(400).json({ error: 'Invalid releaseType. Must be "now" or "upcoming".' });
  }

  if (releaseType === 'now') {
    if (rating == null) {
      return res.status(400).json({ error: '"rating" is required for releaseType "now".' });
    }
    if (!timings || timings.length === 0) {
      return res.status(400).json({ error: '"timings" are required for releaseType "now".' });
    }
    if (release) {
      return res.status(400).json({ error: '"release" must not be provided for releaseType "now".' });
    }
  }

  if (releaseType === 'upcoming') {
    if (!release) {
      return res.status(400).json({ error: '"release" is required for releaseType "upcoming".' });
    }
    if (rating || (timings && timings.length > 0)) {
      return res.status(400).json({ error: '"rating" and "timings" must not be provided for releaseType "upcoming".' });
    }
  }

  next();
};

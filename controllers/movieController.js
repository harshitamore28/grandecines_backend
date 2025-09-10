// controllers/movieController.js
const Movie = require('../models/Movie');
const { cloudinary } = require('../utils/cloudinary');

// Helper to normalize timings
const parseTimings = (timings) => {
  if (!timings) return [];
  return Array.isArray(timings) ? timings : timings.split(',');
};

// CREATE
exports.createMovie = async (req, res) => {
  try {
    const { name, rating, timings, releaseType, release } = req.body;
    const poster = req.file?.path;
    const public_id = req.file?.filename;

    const movieData = { name, poster, public_id, releaseType };

    if (releaseType === 'now') {
      movieData.rating = rating;
      movieData.timings = parseTimings(timings);
    } else if (releaseType === 'upcoming') {
      movieData.release = release;
    }

    const movie = new Movie(movieData);
    await movie.save();
    res.status(201).json(movie);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// READ ALL
exports.getAllMovies = async (req, res) => {
  try {
    const { releaseType } = req.query;
    let filter = {};
    if (releaseType === 'now') {
      filter.releaseType = 'now';
    } else if (releaseType === 'upcoming') {
      filter.releaseType = 'upcoming';
    }

    const movies = await Movie.find(filter);
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// READ ONE
exports.getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE
exports.updateMovie = async (req, res) => {
  try {
    const { name, rating, timings, releaseType, release } = req.body;
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ error: 'Movie not found' });

    // Delete old image if new one uploaded
    if (req.file) {
      if (movie.public_id) await cloudinary.uploader.destroy(movie.public_id);
      movie.poster = req.file.path;
      movie.public_id = req.file.filename;
    }

    movie.name = name ?? movie.name;
    movie.releaseType = releaseType ?? movie.releaseType;

    if (releaseType === 'now') {
      movie.rating = rating;
      movie.timings = parseTimings(timings);
      movie.release = undefined;
    } else if (releaseType === 'upcoming') {
      movie.release = release;
      movie.rating = undefined;
      movie.timings = undefined;
    }

    await movie.save();
    res.json(movie);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE
exports.deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ error: 'Movie not found' });

    if (movie.public_id) {
      await cloudinary.uploader.destroy(movie.public_id);
    }

    await movie.deleteOne();
    res.json({ message: 'Movie and poster deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

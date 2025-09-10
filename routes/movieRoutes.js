const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../utils/cloudinary');
const upload = multer({ storage });

const validateMovie = require('../middlewares/validateMovie');
const movieController = require('../controllers/movieController');

// CREATE
router.post('/', upload.single('poster'), validateMovie, movieController.createMovie);

// READ ALL
router.get('/', movieController.getAllMovies);

// READ ONE
router.get('/:id', movieController.getMovieById);

// UPDATE
router.put('/:id', upload.single('poster'), validateMovie, movieController.updateMovie);

// DELETE
router.delete('/:id', movieController.deleteMovie);

module.exports = router;

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../utils/cloudinary');
const upload = multer({ storage });

const validateMovie = require('../middlewares/validateMovie');
const foodController = require('../controllers/foodController');

// CREATE
// router.post('/', foodController.createFood);

// READ ALL
router.get('/', foodController.getAllFood);

// READ ONE
// router.get('/:id', foodController.getFoodById);

// UPDATE
router.put('/:id', upload.single('image'), foodController.updateFood);

// DELETE
// router.delete('/:id', foodController.deleteFood);

module.exports = router;

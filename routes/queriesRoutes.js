const express = require('express');
const router = express.Router();
const queriesController = require('../controllers/queriesController');

// DELETE
router.delete('/:id', queriesController.deleteQuery);

// CREATE
router.post('/', queriesController.postQuery);

// READ ALL
router.get('/',  queriesController.getAllQueries);

module.exports = router;
const express = require('express');
const router = express.Router();

const ordersController = require('../controllers/ordersController.js');



// READ ONE USER // Get orders of a single user
router.get('/user/:userId', ordersController.getOrderByUser);

// READ ONE ORDER //Get a single order by ID
router.get('/:id', ordersController.getOrderById);

// UPDATE
router.put('/:id', ordersController.updateOrder);

// DELETE
router.delete('/:id', ordersController.deleteOrder);

// CREATE
router.post('/', ordersController.createOrder);

// READ ALL
router.get('/',  ordersController.getAllOrders);

module.exports = router;

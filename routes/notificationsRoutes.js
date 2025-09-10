const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController.js');

// SEND
router.post('/send', notificationsController.sendNotifications);


module.exports = router;
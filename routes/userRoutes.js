const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/check/:phone', userController.checkUser);
router.post('/create', userController.createUser);
router.get('/:phone', userController.getUserByPhone);
router.get('/', userController.getAllUsers);
router.put('/:id', userController.updateUser);
router.put('/:id/fcm-token', userController.addFcmToken);
router.delete('/:id/fcm-token', userController.removeFcmToken);
module.exports = router;
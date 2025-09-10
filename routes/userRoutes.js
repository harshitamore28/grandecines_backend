const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/check/:phone', userController.checkUser);
router.post('/create', userController.createUser);
router.get('/:phone', userController.getUserByPhone);
router.get('/', userController.getAllUsers);
router.post('/:id', userController.updateUser);
module.exports = router;
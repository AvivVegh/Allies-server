var express = require('express');
var router = express.Router();

var userController = require('../controllers/userController');
var authController = require('../controllers/authController');

// route middleware to verify a token
router.use(authController.verifyToken);

router.post('/auth', userController.authenticate);

router.post('/user/register', userController.register);

router.post('/user/login',userController.login);

router.put('/user/update', userController.update);

router.get('/user/find/:id', userController.findById);

router.delete('/user/delete/:id', userController.deleteById);

module.exports = router;

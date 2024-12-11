const express = require('express');
const authController = require('../controllers/authController');
const { validateUser } = require('../middlewares/zod-validator');

const router = express.Router();

router.post('/register', validateUser, authController.register);
router.post('/login', validateUser, authController.login);

module.exports = router;
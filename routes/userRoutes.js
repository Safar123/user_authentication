const express = require ('express');
const { signUpUser } = require('../controller/authController');

const router = express.Router();

router.route('/signUp').post(signUpUser);


module.exports = router;
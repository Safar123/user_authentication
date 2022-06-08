const express = require ('express');
const { signUpUser, logInUser, uploadUserPhoto } = require('../controller/authController');
const { getAllUser, getSingleUser, updateUserSelf, deleteUser } = require('../controller/userController');

const router = express.Router();
router.route('/signUp').post( uploadUserPhoto ,signUpUser);
router.route('/').get(getAllUser);
router.route('/:id').get(getSingleUser).patch(updateUserSelf).delete(deleteUser);
router.route('/login').post(logInUser);

module.exports = router;
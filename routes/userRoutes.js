const express = require ('express');
const { signUpUser } = require('../controller/authController');
const { getAllUser, getSingleUser, updateUserSelf, deleteUser } = require('../controller/userController');

const router = express.Router();

router.route('/signUp').post(signUpUser);
router.route('/').get(getAllUser);
router.route('/:id').get(getSingleUser).patch(updateUserSelf).delete(deleteUser);

module.exports = router;
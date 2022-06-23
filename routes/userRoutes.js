const express = require("express");
const {
    signUpUser,
    logInUser,
    resizeUserImage,
    uploadUserImage,
    protectRoute,
    authorizationRoutes,
    forgetPassword,
    resetPassword
} = require("../controller/authController");
const {
    getAllUser,
    getSingleUser,
    updateUserSelf,
    deleteUser,
} = require("../controller/userController");

const router = express.Router();
router.route("/signUp").post(uploadUserImage, resizeUserImage, signUpUser);
router.route("/").get(protectRoute, authorizationRoutes('admin', 'superadmin'), getAllUser);
router
    .route("/:id")
    .get(protectRoute,getSingleUser)
    .patch(protectRoute, updateUserSelf)
    .delete(protectRoute, authorizationRoutes("admin", 'superadmin'), deleteUser);
router.route("/login").post(logInUser);
router.post('/resetPassword/:token', resetPassword)
router.post('/forgetPassword', forgetPassword)

module.exports = router;

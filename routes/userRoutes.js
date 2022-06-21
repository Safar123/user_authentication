const express = require("express");
const {
    signUpUser,
    logInUser,
    resizeUserImage,
    uploadUserImage,
    protectRoute,
    authorizationRoutes,
} = require("../controller/authController");
const {
    getAllUser,
    getSingleUser,
    updateUserSelf,
    deleteUser,
} = require("../controller/userController");

const router = express.Router();
router.route("/signUp").post(uploadUserImage, resizeUserImage, signUpUser);
router.route("/").get(protectRoute, getAllUser);
router
    .route("/:id")
    .get(getSingleUser)
    .patch(protectRoute, updateUserSelf)
    .delete(protectRoute, authorizationRoutes("admin"), deleteUser);
router.route("/login").post(logInUser);

module.exports = router;

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);
router
  .route("/update-password")
  .post(authMiddleware.protect, authController.updatePassword);
router.route("/forget-password").post(authController.forgetPassword);
router.route("/reset-password/:token").patch(authController.resetPassword);

module.exports = router;

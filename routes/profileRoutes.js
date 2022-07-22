const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const profileController = require("../controllers/profileController");

router
  .route("/:id")
  .get(authMiddleware.protect, profileController.getSingleProfile);

module.exports = router;

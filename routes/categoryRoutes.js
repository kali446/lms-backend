const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const categoryController = require("../controllers/categoryController");

router
  .route("/")
  .get(authMiddleware.protect, categoryController.getAllCategories);

module.exports = router;

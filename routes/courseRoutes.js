const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const courseController = require("../controllers/courseController");

module.exports = router;

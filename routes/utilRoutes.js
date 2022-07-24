const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const utilController = require("../controllers/utilController")

router.route("/remove-media").post(authMiddleware.protect, utilController.removeMedia);

module.exports = router;

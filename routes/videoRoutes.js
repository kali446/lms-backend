const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const videoController = require("../controllers/videoController");

router.route("/:id").get(authMiddleware.protect, videoController.getVideo);
router
  .route("/")
  .post(
    authMiddleware.protect,
    authMiddleware.restrictTo("teacher"),
    videoController.createVideo
  );
router
  .route("/delete/:id")
  .post(
    authMiddleware.protect,
    authMiddleware.restrictTo("teacher"),
    videoController.deleteVideo
  );
router
  .route("/:id")
  .patch(
    authMiddleware.protect,
    authMiddleware.restrictTo("teacher"),
    videoController.updateVideo
  );

router
  .route("/:id/like")
  .put(authMiddleware.protect, videoController.likeVideo);
router
  .route("/:id/dislike")
  .put(authMiddleware.protect, videoController.dislikeVideo);

module.exports = router;

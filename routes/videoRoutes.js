const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const videoController = require("../controllers/videoController");

router
  .route("/")
  .post(
    authMiddleware.protect,
    authMiddleware.restrictTo("teacher"),
    videoController.createVideo
  );
router
  .route("/:id/delete")
  .post(
    authMiddleware.protect,
    authMiddleware.restrictTo("teacher"),
    videoController.deleteVideo
  );
router.route("/:id").get(authMiddleware.protect, videoController.getVideo);
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
router
  .route("/:id/add-comment")
  .put(authMiddleware.protect, videoController.createComment);
router
  .route("/:id/remove-comment")
  .put(authMiddleware.protect, videoController.removeComment);
router.route("/:id/get-comments").get(authMiddleware.protect, videoController.getVideoComments)
router.route("/:id/update-comment").put(authMiddleware.protect, videoController.updateVideoComment)

module.exports = router;

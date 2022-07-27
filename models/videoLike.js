const mongoose = require("mongoose");

const videoLikeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
    like: {
      type: Number,
      required: [true, "required field"],
    },
  },
  {
    timestamps: true,
  }
);

const VideoLike = mongoose.model("VideoLike", videoLikeSchema);

module.exports = VideoLike;

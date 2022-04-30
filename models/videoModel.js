const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is a required"],
    },
    description: {
      type: String,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    url: {
      type: String,
    },
    videoLength: {
      type: Number,
    },
    videoPublicId: {
      type: String,
    },
    defaultThumbnail: {
      type: String,
    },
    customThumbnail: {
      type: String,
    },
    customThumbnailPublicId: {
      type: String,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "Video must belong to  a category"],
    },
    creator: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Video must belong to a user"],
    },
  },
  {
    timestamps: true,
  }
);

const Video = mongoose.model("Video", videoSchema);

module.exports = Video;

const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Video title is required"],
    },
    description: {
      type: String,
    },
    thumbnail: {
      type: String,
      default:
        "https://res.cloudinary.com/dq87imngy/image/upload/v1653667310/defaultImage_smbzwn.png",
    },
    thumbnailPublicId: {
      type: String,
    },
    videoUrl: {
      type: String,
    },
    videoUrlPublicId: {
      type: String,
    },
    videoLength: {
      type: Number,
      default: 0,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        comment: {
          type: String,
          required: [true, "Comment is required"],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// populating category in video find
videoSchema.pre("find", function () {
  this.populate("category");
});

const Video = mongoose.model("Video", videoSchema);

module.exports = Video;

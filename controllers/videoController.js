const catchAsync = require("../utils/catchAsync");
const Video = require("../models/video");
const User = require("../models/user");
const AppError = require("../utils/appError");
const VideoLike = require("../models/videoLike");
const cloudinary = require("cloudinary");

exports.getVideo = catchAsync(async (req, res, next) => {
  const videoId = req.params.id;
  const video = await Video.findById(videoId);

  if (!video) {
    return next(new AppError("Video not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: video,
  });
});

exports.createVideo = catchAsync(async (req, res, next) => {
  const video = await Video.create(req.body);
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // update user with video
  user.videos = [...user.videos, video._id];
  await user.save();

  res.status(200).json({
    status: "success",
    data: video,
  });
});

exports.updateVideo = catchAsync(async (req, res, next) => {
  const videoId = req.params.id;
  const video = await Video.findById(videoId);

  if (!video) {
    return next(new AppError("Video not found", 404));
  }

  const updatedVideo = await Video.findByIdAndUpdate(videoId, req.body, {
    new: true,
  });

  res.status(200).json({
    status: "success",
    data: updatedVideo,
  });
});

exports.deleteVideo = catchAsync(async (req, res, next) => {
  const videoId = req.params.id;
  const video = await Video.findById(videoId);
  const user = await User.findById(req.user._id);
  const { thumbnailPublicId, videoUrlPublicId } = req.body;

  if (!video) {
    return next(new AppError("Video not found", 404));
  }

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // delete assets
  await cloudinary.v2.uploader.destroy(thumbnailPublicId, {
    resource_type: "image",
  });
  await cloudinary.v2.uploader.destroy(videoUrlPublicId, {
    resource_type: "video",
  });

  // remove video from user table
  user.videos = user.videos.filter((item) => item.toString() !== videoId);
  await user.save();

  await Video.findByIdAndDelete(videoId);

  res.status(200).json({
    status: "success",
    message: "video deleted",
  });
});

exports.likeVideo = catchAsync(async (req, res, next) => {
  const videoId = req.params.id;
  const video = await Video.findById(videoId);
  const userId = req.user._id;

  if (!video) {
    return next(new AppError("Video not found", 404));
  }

  const liked = await VideoLike.findOne({
    user: userId,
    video: videoId,
    like: 1,
  });

  const disliked = await VideoLike.findOne({
    where: {
      userId: req.user.id,
      videoId: req.params.id,
      like: -1,
    },
  });

  console.log(liked);

  if (liked) {
    await liked.delete();
  } else if (disliked) {
    disliked.like = 1;
    await disliked.save();
  } else {
    await VideoLike.create({
      user: userId,
      video: videoId,
      like: 1,
    });
  }

  res.status(200).json({
    status: "success",
    data: {},
  });
});

exports.dislikeVideo = catchAsync(async (req, res, next) => {
  const videoId = req.params.id;
  const video = await Video.findById(videoId);
  const userId = req.user._id;

  if (!video) {
    return next(new AppError("Video not found", 404));
  }

  const disliked = await VideoLike.findOne({
    user: userId,
    video: videoId,
    like: -1,
  });

  const liked = await VideoLike.findOne({
    user: userId,
    video: videoId,
    like: 1,
  });

  if (disliked) {
    await disliked.delete();
  } else if (liked) {
    liked.like = -1;
    await liked.save();
  } else {
    await VideoLike.create({
      user: userId,
      video: videoId,
      like: -1,
    });
  }

  res.status(200).json({
    status: "success",
    data: {},
  });
});

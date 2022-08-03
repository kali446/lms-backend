const catchAsync = require("../utils/catchAsync");
const Video = require("../models/video");
const User = require("../models/user");
const AppError = require("../utils/appError");
const VideoLike = require("../models/videoLike");
const Comment = require("../models/comment");
const cloudinary = require("cloudinary");

exports.getVideo = catchAsync(async (req, res, next) => {
  const videoId = req.params.id;
  const video = await Video.findById(videoId).populate({
    path: "creator",
    select: ["username", "avatar", "aboutMe"],
  });

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
  const video = await Video.findOne({
    _id: videoId,
    creator: req.user._id,
  });

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
  const video = await Video.findOne({
    _id: videoId,
    creator: req.user._id,
  });
  const user = await User.findById(req.user._id);
  const { thumbnailPublicId, videoUrlPublicId } = req.body;

  // note: we need to make sure only creator can delete his videos

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
    user: userId,
    video: videoId,
    like: -1,
  });

  if (liked) {
    await liked.delete();

    video.likes = video.likes.filter(
      (item) => item.toString() !== req.user._id.toString()
    );
    await video.save();
  } else if (disliked) {
    disliked.like = 1;
    await disliked.save();

    video.likes = [disliked.user, ...video.likes];
    video.dislikes = video.dislikes.filter(
      (item) => item.toString() !== disliked.user.toString()
    );
    await video.save();
  } else {
    const like = await VideoLike.create({
      user: userId,
      video: videoId,
      like: 1,
    });

    video.likes = [like.user, ...video.likes];
    await video.save();
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

    video.dislikes = video.dislikes.filter(
      (item) => item.toString() !== req.user._id.toString()
    );
    await video.save();
  } else if (liked) {
    liked.like = -1;
    await liked.save();

    video.dislikes = [liked.user, ...video.dislikes];
    video.likes = video.likes.filter(
      (item) => item.toString() !== liked.user.toString()
    );
    await video.save();
  } else {
    const dislike = await VideoLike.create({
      user: userId,
      video: videoId,
      like: -1,
    });

    video.dislikes = [dislike.user, ...video.dislikes];
    await video.save();
  }

  res.status(200).json({
    status: "success",
    data: {},
  });
});

exports.createComment = catchAsync(async (req, res, next) => {
  const videoId = req.params.id;
  const video = await Video.findById(videoId);

  if (!video) {
    return next(new AppError("Video not found", 404));
  }

  const commentObj = {
    video: videoId,
    user: req.user._id,
    text: req.body.text,
  };

  const comment = await Comment.create(commentObj);

  const newComment = await Comment.findById(comment._id).populate({
    path: "user",
    select: ["username", "avatar"],
  });

  video.comments = [comment._id, ...video.comments];
  await video.save();

  res.status(200).json({
    status: "success",
    data: newComment,
  });
});

exports.removeComment = catchAsync(async (req, res, next) => {
  const videoId = req.params.id;
  const video = await Video.findById(videoId);
  const comment = await Comment.findById(req.body.commentId);

  if (!video) {
    return next(new AppError("Video not found", 404));
  }

  if (!comment) {
    return next(new AppError("Comment not found", 404));
  }

  const deletedComment = await Comment.findByIdAndDelete(comment._id);

  video.comments = video.comments.filter(
    (item) => item.toString() !== comment._id.toString()
  );

  await video.save();

  res.status(200).json({
    status: "success",
    data: deletedComment,
  });
});

exports.getVideoComments = catchAsync(async (req, res, next) => {
  const videoId = req.params.id;
  const video = await Video.findById(videoId);
  const comments = await Comment.find({
    video: video._id,
  })
    .populate({
      path: "user",
      select: ["username", "avatar"],
    })
    .sort([["createdAt", -1]]);

  if (!video) {
    return next(new AppError("Video not found", 404));
  }

  if (!comments.length) {
    return next(new AppError("No comment on this video", 404));
  }

  res.status(200).json({
    status: "success",
    data: comments,
  });
});

exports.updateVideoComment = catchAsync(async (req, res, next) => {
  const videoId = req.params.id;
  const video = await Video.findById(videoId);
  const comment = await Comment.findOne({
    _id: req.body.commentId,
    user: req.user._id,
    video: videoId,
  });

  if (!video) {
    return next(new AppError("Video not found", 404));
  }

  if (!comment) {
    return next(new AppError("Comment not found", 404));
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    comment._id,
    req.body,
    {
      new: true,
    }
  ).populate({
    path: "user",
    select: ["username", "avatar"],
  });

  res.status(200).json({
    status: "success",
    data: updatedComment,
  });
});

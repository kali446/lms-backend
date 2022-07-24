const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const AppError = require("../utils/appError");

exports.getSingleProfile = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  const user = await User.findById(userId);

  if (!user) {
    return next(new AppError("No profile found!", 404));
  }

  const isMe = req.user._id.toString() === userId ? true : false;

  const profileObj = {
    isMe,
    ...user._doc,
  };

  res.status(200).json({
    status: "success",
    data: profileObj,
  });
});

exports.editProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError("No profile found!", 404));
  }

  const { name, email, avatar, cover, avatarPublicId, coverPublicId, aboutMe } =
    req.body;

  const updateObj = {
    name,
    email,
    avatar,
    cover,
    avatarPublicId,
    coverPublicId,
    aboutMe,
  };

  const updatedUser = await User.findByIdAndUpdate(req.user._id, updateObj, {
    new: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      isMe: true,
      ...updatedUser._doc,
    },
  });
});

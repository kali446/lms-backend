const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const cloudinary = require("cloudinary");

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

  if (user.avatarPublicId && avatarPublicId) {
    await cloudinary.v2.uploader.destroy(user.avatarPublicId, {
      resource_type: "image",
    });
  }

  if (user.coverPublicId && coverPublicId) {
    await cloudinary.v2.uploader.destroy(user.coverPublicId, {
      resource_type: "image",
    });
  }

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

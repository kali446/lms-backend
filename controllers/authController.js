const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
const AppError = require("../utils/appError");
const sendEmail = require("../services/email");
const crypto = require("crypto");
const { signToken } = require("../utils");

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });

  // creating a token
  const token = signToken(newUser.id);

  const obj = {
    _id: newUser._id,
    username: newUser.username,
    createdAt: newUser.createdAt,
    updatedAt: newUser.updatedAt,
    token,
  };

  res.status(201).json({
    status: "success",
    user: obj,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // hide password
  user.password = undefined;

  // creating a token
  const token = signToken(user.id);

  const obj = {
    _id: user._id,
    username: user.username,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    token,
  };

  res.status(200).json({
    status: "success",
    user: obj,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError("Your current password is wrong", 401));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Password updated",
  });
});

exports.forgetPassword = catchAsync(async (req, res, next) => {
  // 1 Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("There is no user with that email", 404));
  }

  // 2 Generate random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3 Send it to users email
  const resetURL = `${process.env.FRONTEND_URL}reset-password/${resetToken}`;

  const message = `Forgot your password ? Click on the reset link "${resetURL}" to reset your password`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (only valid for 10 min)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return next(
      new AppError(
        "There was error sending the email. Please try again later!",
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1 Get user based on token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2 If token has not expired and there is user, set new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3 send JWT to user
  const token = signToken(user.id);

  res.status(200).json({
    status: "success",
    token,
    user,
  });
});

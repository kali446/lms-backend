const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Category = require("../models/category");

exports.getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.find();

  if (!categories.length) {
    return next(new AppError("No categories found"));
  }

  res.status(200).json({
    status: "success",
    data: categories,
  });
});

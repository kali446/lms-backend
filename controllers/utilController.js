const catchAsync = require("../utils/catchAsync");
const cloudinary = require("cloudinary");

exports.removeMedia = catchAsync(async (req, res, next) => {
  const { resourceType, publicId } = req.body;

  await cloudinary.v2.uploader.destroy(publicId, {
    resource_type: resourceType,
  });

  res.status(200).json({
    status: "success",
    message: "Asset removed",
  });
});

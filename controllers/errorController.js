const AppError = require("../utils/appError");

const handleValidationErrorDB = (error) => {
  const errors = Object.values(error.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;

  return new AppError(message, 400);
};

const handleDuplicateFields = (err) => {
  const value = Object.values(err.keyValue).join(", ");

  const message = `Duplicate field value ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleJWTError = (err) => {
  const message = `Your token is expired! Please log in again to get one`;
  return new AppError(message, 401);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let error = { ...err };

  if (error.code === 11000) {
    error = handleDuplicateFields(error);

    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else if (error._message === "User validation failed") {
    error = handleValidationErrorDB(error);

    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else if (error.name === "JsonWebTokenError") {
    error = handleJWTError(error);

    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
};

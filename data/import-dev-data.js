const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Category = require("../models/category");
const User = require("../models/user");

dotenv.config({ path: "./config.env" });

// connect to DB
const DB = process.env.DATABASE_LOCAL;
mongoose.connect(DB).then(() => console.log("DB connection successful!"));

// Read JSON file
const categories = JSON.parse(
  fs.readFileSync(`${__dirname}/categories.json`, "utf-8")
);
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"));

// Import data into db
const importData = async () => {
  try {
    await Category.create(categories);
    await User.create(users);
    console.log("Data successfully loaded!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// Delete data from db
const deleteData = async () => {
  try {
    await Category.deleteMany();
    await User.deleteMany();
    console.log("Data successfully deleted!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}

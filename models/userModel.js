const mongoose = require("mongoose");
const crypto = require("crypto");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  fullName: {
    type: String,
    required: [true, "Please tell us your name!"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 6,
    select: true,
  },

  active: {
    type: Boolean,
    default: false,
    select: true,
  },
  stripeCustomerID: {
    type: String,
    default: "",
    select: true,
  },
  companies: [
    {
      name: String,
      timeZone: String,
      stripeSubscriptionID: String,
    },
  ],
  activationToken: {
    type: String,
    default: function () {
      return crypto.randomBytes(20).toString("hex");
    },
  },
});

module.exports = mongoose.model("User", userSchema);

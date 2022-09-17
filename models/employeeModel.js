const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const employeeRoleModel = require("./employeeRoleModel");

const Schema = mongoose.Schema;

const employeeSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: ObjectId,
    required: true,
  },
  companyId: {
    type: ObjectId,
    required: true,
  },
  employeeRoleId: {
    type: ObjectId,
    required: true,
  },
});

module.exports = mongoose.model("Employee", employeeSchema);

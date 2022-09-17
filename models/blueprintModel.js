const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const Schema = mongoose.Schema;

const blueprintSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  userId: {
    type: ObjectId,
    required: true,
  },
  companyId: {
    type: ObjectId,
    required: true,
  },
  timeSlot: [
    {
      employeeRoleId: ObjectId,
      requiredEmployees: Number,
      day: String,
      startTime: String,
      endTime: String,
    },
  ],
});

module.exports = mongoose.model("Blueprint", blueprintSchema);

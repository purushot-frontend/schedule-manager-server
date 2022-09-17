const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const catchAsync = require("../utils/catchAsync");
const Schema = mongoose.Schema;

const scheduleSchema = new Schema({
  userId: {
    type: ObjectId,
    required: true,
  },
  companyId: {
    type: ObjectId,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  startDateEpoch: {
    type: Number,
    required: true,
  },

  timeSlot: [
    {
      employeeId: ObjectId,
      startTime: Date,
      endTime: Date,
      startTimeEpoch: Number,
      endTimeEpoch: Number,
    },
  ],
});

module.exports = mongoose.model("Schedule", scheduleSchema);

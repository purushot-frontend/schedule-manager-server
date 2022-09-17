const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const Schedule = require("../models/scheduleModel");

const Blueprint = require("../models/blueprintModel");
const EmployeeRole = require("../models/employeeRoleModel");
const Employee = require("../models/employeeModel");
const catchAsync = require("../utils/catchAsync");
const dateHelper = require("../utils/dateHelper");

/*helper funcs*/

//get latest state of schedule in desired format using aggregation
const getScheduleState = async (scheduleId, userId, companyId) => {
  const schedule = await Schedule.aggregate([
    {
      $match: {
        _id: ObjectId(scheduleId),
        userId: ObjectId(userId),
        companyId: ObjectId(companyId),
      },
    },
    {
      $unwind: {
        path: "$timeSlot",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "employees",
        localField: "timeSlot.employeeId",
        foreignField: "_id",
        as: "timeSlot.employee",
      },
    },
    {
      $unwind: {
        path: "$timeSlot.employee",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: "$timeSlot.employee",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: "$_id",
        userId: {
          $first: "$userId",
        },
        companyId: {
          $first: "$companyId",
        },
        startDate: {
          $first: "$startDate",
        },
        startDateEpoch: {
          $first: "$startDateEpoch",
        },
        timeSlot: {
          $addToSet: "$timeSlot",
        },
      },
    },
  ]);

  if (!schedule) {
    const error = new Error("Schedule Not Found.");
    error.statusCode = 404;
    throw error;
  }
  return schedule;
};

/* end - helper funcs */

//create schedule function
exports.createSchedule = catchAsync(async (req, res, next) => {
  const { applyBlueprint, blueprintId, startDate, endDate } = req.body;

  let thisBlueprint = "";
  if (applyBlueprint) {
    //verify blueprint

    thisBlueprint = await Blueprint.findOne({
      _id: ObjectId(blueprintId),
      userId: ObjectId(req.userId),
      companyId: ObjectId(req.company.id),
    });
    if (!thisBlueprint) {
      const error = new Error("Blueprint Not Found.");
      error.statusCode = 404;
      throw error;
    }
  }

  // create schedule
  const thisSchedule = await Schedule.create({
    userId: ObjectId(req.userId),

    companyId: ObjectId(req.company.id),
    startDate: `${startDate}Z`,
    startDateEpoch: Date.parse(`${startDate}Z`),
  });

  //if no need to apply blueprint, send a response and end the script
  if (!applyBlueprint) {
    res.status(201).json({
      status: "success",
      data: thisSchedule,
    });
    return;
  }
  /* --- Apply Blueprint Algorithm Starts --- */
  //loop through blueprint
  const thisTimeslot = thisBlueprint?.timeSlot;

  for (j = 0; j < thisTimeslot?.length; j++) {
    // thisBlueprint.timeSlot.forEach(async (element) => {
    const employeeRoleId = thisTimeslot[j].employeeRoleId;
    const requiredEmployees = thisTimeslot[j].requiredEmployees;
    const day = thisTimeslot[j].day;
    const startTime = thisTimeslot[j].startTime;
    const endTime = thisTimeslot[j].endTime;

    //get employee array
    const thisEmployees = await Employee.aggregate([
      {
        $match: {
          userId: ObjectId(req.userId),
          companyId: ObjectId(req.company.id),
          employeeRoleId: ObjectId(employeeRoleId),
        },
      },
      {
        $group: {
          _id: "$employeeRoleId",
          employees: {
            $addToSet: "$_id",
          },
        },
      },
    ]);

    let suitableEmployees = thisEmployees[0]?.employees || [];
    suitableEmployees = suitableEmployees?.map((x) => String(x));

    //generate blueprintDates
    let blueprintStartTime = dateHelper.makeDate(
      thisSchedule.startDate,
      day,
      startTime
    );

    let blueprintEndTime = dateHelper.makeDate(
      thisSchedule.startDate,
      day,
      endTime
    );
    let blueprintStartTimeEpoch = Date.parse(blueprintStartTime);
    let blueprintEndTimeEpoch = Date.parse(blueprintEndTime);

    //if user selected inverse time. switch times.
    if (blueprintStartTimeEpoch > blueprintEndTimeEpoch) {
      [blueprintStartTime, blueprintEndTime] = [
        blueprintEndTime,
        blueprintStartTime,
      ];
      [blueprintStartTimeEpoch, blueprintEndTimeEpoch] = [
        blueprintEndTimeEpoch,
        blueprintStartTimeEpoch,
      ];
    }

    //get conflicting time slots from database.
    const conflictingTimeSlots = await Schedule.aggregate([
      {
        $match: {
          _id: ObjectId(thisSchedule._id),
          userId: ObjectId(req.userId),
          companyId: ObjectId(req.company.id),
          timeSlot: {
            $elemMatch: {
              $or: [
                {
                  startTimeEpoch: { $lt: blueprintEndTimeEpoch },
                  endTimeEpoch: { $gte: blueprintEndTimeEpoch },
                },
                {
                  startTimeEpoch: { $lte: blueprintStartTimeEpoch },
                  endTimeEpoch: { $gt: blueprintStartTimeEpoch },
                },
                {
                  startTimeEpoch: { $gte: blueprintStartTimeEpoch },
                  endTimeEpoch: { $lte: blueprintEndTimeEpoch },
                },
              ],
            },
          },
        },
      },
      {
        $unwind: {
          path: "$timeSlot",
          includeArrayIndex: "string",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          $or: [
            {
              "timeSlot.startTimeEpoch": { $lt: blueprintEndTimeEpoch },
              "timeSlot.endTimeEpoch": { $gte: blueprintEndTimeEpoch },
            },
            {
              "timeSlot.startTimeEpoch": { $lte: blueprintStartTimeEpoch },
              "timeSlot.endTimeEpoch": { $gt: blueprintStartTimeEpoch },
            },
            {
              "timeSlot.startTimeEpoch": { $gte: blueprintStartTimeEpoch },
              "timeSlot.endDateEpoch": { $lte: blueprintEndTimeEpoch },
            },
          ],
        },
      },
      {
        $group: {
          _id: "$_id",
          conflictingEmployees: {
            $addToSet: "$timeSlot.employeeId",
          },
        },
      },
    ]);

    let conflictingEmployees = conflictingTimeSlots[0]
      ? JSON.parse(JSON.stringify(conflictingTimeSlots[0])).conflictingEmployees
      : [];

    // form elible employees array by removing conflicting employees from suitable employees.
    const eligibleEmployees = suitableEmployees?.filter(
      (n) => !conflictingEmployees?.includes(n)
    );

    // loop eligble employees and insert into timeslot.
    console.log("potential employees", suitableEmployees);
    console.log("conflicting employees", conflictingEmployees);
    console.log("eligible employees", eligibleEmployees);

    let hired = 0;
    for (i = 0; i < eligibleEmployees?.length; i++) {
      // eligibleEmployees.forEach(async (id) => {
      if (hired >= requiredEmployees) {
        //hired enough employees. stopping the loop.
        break;
      }
     

      //insert into timeslot.
      const insertSchedule = await Schedule.findOneAndUpdate(
        {
          _id: ObjectId(thisSchedule._id),
        },
        {
          $push: {
            timeSlot: {
              employeeId: ObjectId(eligibleEmployees[i]),
              startTime: blueprintStartTime,
              endTime: blueprintEndTime,
              startTimeEpoch: blueprintStartTimeEpoch,
              endTimeEpoch: blueprintEndTimeEpoch,
            },
          },
        }
      );
      hired++;
    }
  }

  //get latest schedule state and send response
  const latestScheduleState = await Schedule.findOne({
    _id: ObjectId(thisSchedule._id),
  });
  res.status(201).json({
    status: "success",
    data: latestScheduleState,
  });
});

exports.getSchedule = catchAsync(async (req, res, next) => {
  //receive data

  const { scheduleId } = req.params;

  // getting latest state

  const schedule = await Schedule.aggregate([
    {
      $match: {
        _id: ObjectId(scheduleId),
        userId: ObjectId(req.userId),
        companyId: ObjectId(req.company.id),
      },
    },
    {
      $unwind: {
        path: "$timeSlot",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "employees",
        localField: "timeSlot.employeeId",
        foreignField: "_id",
        as: "timeSlot.employee",
      },
    },
    {
      $unwind: {
        path: "$timeSlot.employee",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: "$timeSlot.employee",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: "$_id",
        userId: {
          $first: "$userId",
        },
        companyId: {
          $first: "$companyId",
        },
        startDate: {
          $first: "$startDate",
        },
        startDateEpoch: {
          $first: "$startDateEpoch",
        },
        timeSlot: {
          $addToSet: "$timeSlot",
        },
      },
    },
  ]);

  if (!schedule) {
    const error = new Error("Schedule Not Found.");
    error.statusCode = 404;
    throw error;
  }
  //send response
  res.status(200).json({
    status: "success",
    data: { ...schedule[0] },
  });
});

exports.getSchedules = catchAsync(async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 3;
  const totalItems = await Schedule.find({
    userId: ObjectId(req.userId),
    companyId: ObjectId(req.company.id),
  }).countDocuments();
  const schedule = await Schedule.find({
    userId: ObjectId(req.userId),
    companyId: ObjectId(req.company.id),
  })
    .skip((currentPage - 1) * perPage)
    .limit(perPage);

  res.status(200).json({
    status: "success",

    data: schedule,
    totalItems,
  });
});

exports.deleteTimeSlot = catchAsync(async (req, res, next) => {
  //receive data

  const { scheduleId, timeSlotId } = req.params;

  //verify schedule
  const checkSchedule = await Schedule.findOne({
    _id: ObjectId(scheduleId),
    userId: ObjectId(req.userId),
    companyId: ObjectId(req.company.id),
  });
  if (!checkSchedule) {
    const error = new Error("Schedule Not Found.");
    error.statusCode = 404;
    throw error;
  }

  const checkTimeSlot = await Schedule.findOne({
    $and: [
      { _id: ObjectId(scheduleId) },
      {
        timeSlot: {
          $elemMatch: { _id: ObjectId(timeSlotId) },
        },
      },
    ],
  });

  if (!checkTimeSlot) {
    const error = new Error("TimeSlot Not Found.");
    error.statusCode = 404;
    throw error;
  }

  // delete time slot
  const deleteTimeSlot = await Schedule.findOneAndUpdate(
    {
      $and: [
        { _id: ObjectId(scheduleId) },
        {
          timeSlot: {
            $elemMatch: { _id: ObjectId(timeSlotId) },
          },
        },
      ],
    },
    { $pull: { timeSlot: { _id: ObjectId(timeSlotId) } } }
  );
  // getting latest state
  const schedule = await Schedule.findOne({
    _id: ObjectId(scheduleId),
  });
  //send response
  res.status(201).json({
    status: "success",
    data: schedule.timeSlot,
  });
});

exports.insertTimeSlot = catchAsync(async (req, res, next) => {
  //receive data
  const { employeeId, day, startTime, endTime } = req.body;
  const { scheduleId } = req.params;

  //verify employee
  const employee = await Employee.findOne({
    _id: ObjectId(employeeId),
    userId: ObjectId(req.userId),
    companyId: ObjectId(req.company.id),
  });
  if (!employee) {
    const error = new Error("Employee Not Found.");
    error.statusCode = 404;
    throw error;
  }

  //verify schedule
  const checkSchedule = await Schedule.findOne({
    _id: ObjectId(scheduleId),
    userId: ObjectId(req.userId),
    companyId: ObjectId(req.company.id),
  });
  if (!checkSchedule) {
    const error = new Error("Schedule Not Found.");
    error.statusCode = 404;
    throw error;
  }

  let startTimeInDate = dateHelper.makeDate(
    checkSchedule.startDate,
    day,
    startTime
  );

  let endTimeInDate = dateHelper.makeDate(
    checkSchedule.startDate,
    day,
    endTime
  );

  let startTimeEpoch = Date.parse(startTimeInDate);
  let endTimeEpoch = Date.parse(endTimeInDate);
  //if user selected inverse time. switch times.
  if (startTimeEpoch > endTimeEpoch) {
    [startTimeInDate, endTimeInDate] = [endTimeInDate, startTimeInDate];
    [startTimeEpoch, endTimeEpoch] = [endTimeEpoch, startTimeEpoch];
  }

  const conflictingTimeSlots = await Schedule.aggregate([
    {
      $match: {
        _id: ObjectId(checkSchedule._id),
        userId: ObjectId(req.userId),
        companyId: ObjectId(req.company.id),
        timeSlot: {
          $elemMatch: {
            $or: [
              {
                startTimeEpoch: { $lt: endTimeEpoch },
                endTimeEpoch: { $gte: endTimeEpoch },
              },
              {
                startTimeEpoch: { $lte: startTimeEpoch },
                endTimeEpoch: { $gt: startTimeEpoch },
              },
              {
                startTimeEpoch: { $gte: startTimeEpoch },
                endTimeEpoch: { $lte: endTimeEpoch },
              },
            ],
          },
        },
      },
    },
    {
      $unwind: {
        path: "$timeSlot",
        includeArrayIndex: "string",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        $or: [
          {
            "timeSlot.startTimeEpoch": { $lt: endTimeEpoch },
            "timeSlot.endTimeEpoch": { $gte: endTimeEpoch },
          },
          {
            "timeSlot.startTimeEpoch": { $lte: startTimeEpoch },
            "timeSlot.endTimeEpoch": { $gt: startTimeEpoch },
          },
          {
            "timeSlot.startTimeEpoch": { $gte: startTimeEpoch },
            "timeSlot.endDateEpoch": { $lte: endTimeEpoch },
          },
        ],
      },
    },
    {
      $group: {
        _id: "$_id",
        conflictingEmployees: {
          $addToSet: "$timeSlot.employeeId",
        },
      },
    },
  ]);
  let conflictingEmployees = conflictingTimeSlots[0]
    ? JSON.parse(JSON.stringify(conflictingTimeSlots[0])).conflictingEmployees
    : [];

  if (conflictingEmployees.includes(employeeId)) {
    const error = new Error(
      "Employee is already working in a conflicting shift."
    );
    error.statusCode = 400;
    throw error;
  }

  //push into schedule time slots.
  const timeSlots = await Schedule.findOneAndUpdate(
    { _id: ObjectId(scheduleId) },
    {
      $push: {
        timeSlot: {
          employeeId: ObjectId(employeeId),
          startTime: startTimeInDate,
          endTime: endTimeInDate,
          startTimeEpoch: startTimeEpoch,
          endTimeEpoch: endTimeEpoch,
        },
      },
    }
  );

  // getting latest state
  const schedule = await getScheduleState(
    scheduleId,
    req.userId,
    req.company.id
  );
  //send response
  res.status(201).json({
    status: "success",
    data: schedule[0],
  });
});

const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const Blueprint = require("./../models/blueprintModel");
const EmployeeRole = require("./../models/employeeRoleModel");
const catchAsync = require("./../utils/catchAsync");

exports.createBlueprint = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  const blueprint = await Blueprint.create({
    name,

    userId: ObjectId(req.userId),

    companyId: ObjectId(req.company.id),
  });

  res.status(201).json({
    status: "success",
    data: blueprint,
  });
});

exports.insertTimeSlot = catchAsync(async (req, res, next) => {
  //receive data
  const { employeeRoleId, requiredEmployees, day, startTime, endTime } =
    req.body;
  const { blueprintId } = req.params;

  //verify employee role
  const employeeRole = await EmployeeRole.findOne({
    _id: ObjectId(employeeRoleId),
    userId: ObjectId(req.userId),
    companyId: ObjectId(req.company.id),
  });
  if (!employeeRole) {
    const error = new Error("Employee Role Not Found.");
    error.statusCode = 404;
    throw error;
  }

  //verify blueprint
  const checkBlueprint = await Blueprint.findOne({
    _id: ObjectId(blueprintId),
    userId: ObjectId(req.userId),
    companyId: ObjectId(req.company.id),
  });
  if (!checkBlueprint) {
    const error = new Error("Blueprint Not Found.");
    error.statusCode = 404;
    throw error;
  }

  //push into blueprint time slots.
  const timeSlots = await Blueprint.findOneAndUpdate(
    { _id: ObjectId(blueprintId) },
    {
      $push: {
        timeSlot: {
          employeeRoleId: ObjectId(employeeRoleId),
          requiredEmployees,
          day,
          startTime,
          endTime,
        },
      },
    }
  );


  // getting latest state
  const blueprint = await Blueprint.findOne({
    _id: ObjectId(blueprintId),
  });
  //send response
  res.status(201).json({
    status: "success",
    data: blueprint,
  });
});

exports.deleteTimeSlot = catchAsync(async (req, res, next) => {
  //receive data

  const { blueprintId, timeSlotId } = req.params;

  //verify blueprint
  const checkBlueprint = await Blueprint.findOne({
    _id: ObjectId(blueprintId),
    userId: ObjectId(req.userId),
    companyId: ObjectId(req.company.id),
  });
  if (!checkBlueprint) {
    const error = new Error("Blueprint Not Found.");
    error.statusCode = 404;
    throw error;
  }

  //verify timeslot
  //{$and:[{_id: ObjectId('61430bc68b708512b47ade09')},{timeSlot:{$elemMatch:{_id: ObjectId('61430cac28e5169a46b4a07f')}}}]}

  const checkTimeSlot = await Blueprint.findOne({
    $and: [
      { _id: ObjectId(blueprintId) },
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
  const deleteTimeSlot = await Blueprint.findOneAndUpdate(
    {
      $and: [
        { _id: ObjectId(blueprintId) },
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
  const blueprint = await Blueprint.findOne({
    _id: ObjectId(blueprintId),
  });
  //send response
  res.status(201).json({
    status: "success",
    data: blueprint.timeSlot,
  });
});

exports.getBlueprint = catchAsync(async (req, res, next) => {
  //receive data

  const { blueprintId } = req.params;

  // getting latest state
  const blueprint = await Blueprint.findOne({
    _id: ObjectId(blueprintId),
    userId: ObjectId(req.userId),
    companyId: ObjectId(req.company.id),
  });

  const employeeRoles = await EmployeeRole.find({
    userId: ObjectId(req.userId),
    companyId: ObjectId(req.company.id),
  }).batchSize(1000);

  if (!blueprint) {
    const error = new Error("Blueprint Not Found.");
    error.statusCode = 404;
    throw error;
  }
  //send response
  res.status(200).json({
    status: "success",
    data: blueprint,
  });
});

exports.getBlueprints = catchAsync(async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 3;
  const mode = req?.query?.mode;
  const totalItems = await Blueprint.find({
    userId: ObjectId(req.userId),
    companyId: ObjectId(req.company.id),
  }).countDocuments();
  let blueprint;
  if (mode === "dropdown") {
    blueprint = await Blueprint.aggregate([
      {
        $match: {
          userId: ObjectId(req.userId),
          companyId: ObjectId(req.company.id),
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
        },
      },
    ]);
  } else {
    blueprint = await Blueprint.find({
      userId: ObjectId(req.userId),
      companyId: ObjectId(req.company.id),
    })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
  }

  res.status(200).json({
    status: "success",

    data: blueprint,
    totalItems,
  });
});

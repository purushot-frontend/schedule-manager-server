const { ObjectId } = require("mongodb");
const Employee = require("./../models/employeeModel");
const EmployeeRole = require("./../models/employeeRoleModel");
const catchAsync = require("./../utils/catchAsync");

exports.createEmployee = catchAsync(async (req, res, next) => {
  const { name, email, employeeRoleId } = req.body;

  // authenticating the request
  const employeeRole = await EmployeeRole.findOne({
    _id: ObjectId(employeeRoleId),
    userId: ObjectId(req.userId),
    companyId: ObjectId(req.company.id),
  });
  if (!employeeRole) {
    const error = new Error("Not a valid employee role.");
    error.statusCode = 404;
    throw error;
  }

  const employee = await Employee.create({
    name,
    email,
    userId: ObjectId(req.userId),

    companyId: ObjectId(req.company.id),
    employeeRoleId: ObjectId(employeeRoleId),
  });

  res.status(201).json({
    status: "success",
    data: { ...employee, roleData: { roleName: employeeRole.name } },
  });
});

exports.updateEmployee = catchAsync(async (req, res, next) => {
  const { name, employeeRoleId } = req.body;
  const { employeeId } = req.params;

  // authenticating the request
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

  const employeeRole = await EmployeeRole.findOne({
    _id: ObjectId(employeeRoleId),
    userId: ObjectId(req.userId),
    companyId: ObjectId(req.company.id),
  });
  if (!employeeRole) {
    const error = new Error("Not a valid employee role.");
    error.statusCode = 404;
    throw error;
  }

  //updating the document
  const updateEmployee = await Employee.updateOne(
    {
      _id: ObjectId(employeeId),
      userId: ObjectId(req.userId),
      companyId: ObjectId(req.company.id),
    },

    {
      name: name,
      employeeRoleId: ObjectId(employeeRoleId),
    }
  );

  //getting latest state
  const currentEmployee = await Employee.findOne({
    _id: ObjectId(employeeId),
    userId: ObjectId(req.userId),
    companyId: ObjectId(req.company.id),
  });

  res.status(200).json({
    status: "success",
    data: {
      ...currentEmployee._doc,
      roleData: { roleName: employeeRole.roleName },
    },
  });
});

exports.getEmployees = catchAsync(async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 3;
  const mode = req?.query?.mode;
  const totalItems = await Employee.find({
    userId: ObjectId(req.userId),
    companyId: ObjectId(req.company.id),
  }).countDocuments();
  let employee = {};
  if (mode === "dropdown") {
    employee = await Employee.aggregate([
      {
        $match: {
          userId: ObjectId(req.userId),
          companyId: ObjectId(req.company.id),
        },
      },

      {
        $lookup: {
          from: "employeeroles",
          localField: "employeeRoleId",
          foreignField: "_id",
          as: "roleData",
        },
      },
      {
        $unwind: {
          path: "$roleData",
          includeArrayIndex: "string",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $project: {
          _id: 1,
          name: 1,

          "roleData.roleName": 1,
        },
      },
    ]);
  } else {
    employee = await Employee.aggregate([
      {
        $match: {
          userId: ObjectId(req.userId),
          companyId: ObjectId(req.company.id),
        },
      },

      {
        $lookup: {
          from: "employeeroles",
          localField: "employeeRoleId",
          foreignField: "_id",
          as: "roleData",
        },
      },
      {
        $unwind: {
          path: "$roleData",
          includeArrayIndex: "string",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          userId: 1,
          companyId: 1,
          employeeRoleId: 1,
          "roleData.roleName": 1,
        },
      },
    ])
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    // const employee = await Employee.find({
    //   userId: ObjectId(req.userId),
    //   companyId: ObjectId(req.company.id),
    // })
    //   .skip((currentPage - 1) * perPage)
    //   .limit(perPage);
  }
  res.status(200).json({
    status: "success",

    data: employee,
    totalItems,
  });
});

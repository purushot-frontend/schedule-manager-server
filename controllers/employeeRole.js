const { ObjectId } = require("mongodb");
const EmployeeRole = require("./../models/employeeRoleModel");
const catchAsync = require("./../utils/catchAsync");

//create employee role
exports.createRole = catchAsync(async (req, res, next) => {
  const { roleName, LA, EP, ER, AV, SE, SC, BP, EX, ML, RP, PL } = req.body;

  const employeeRole = await EmployeeRole.create({
    roleName,
    userId: ObjectId(req.userId),
    LA: { selected: LA },
    EP: { selected: EP },
    ER: { selected: ER },
    AV: { selected: AV },
    SE: { selected: SE },
    SC: { selected: SC },
    BP: { selected: BP },
    EX: { selected: EX },
    ML: { selected: ML },
    RP: { selected: RP },
    PL: { selected: PL },
    companyId: ObjectId(req.company.id),
  });

  res.status(201).json({
    status: "success",
    data: employeeRole,
  });
});

//update employee role
exports.updateRole = catchAsync(async (req, res, next) => {
  const { LA, EP, ER, AV, SE, SC, BP, EX, ML, RP, PL } = req.body;
  const { roleId } = req.params;

  // authenticating the request
  const employeeRole = await EmployeeRole.findOne({
    _id: ObjectId(roleId),
    userId: ObjectId(req.userId),
    companyId: ObjectId(req.company.id),
  });
  if (!employeeRole) {
    const error = new Error("Employee Role Not Found.");
    error.statusCode = 404;
    throw error;
  }

  //updating the document
  const updateEmployeeRole = await EmployeeRole.updateOne(
    {
      _id: ObjectId(roleId),
      userId: ObjectId(req.userId),
      companyId: ObjectId(req.company.id),
    },

    {
      LA: { selected: LA },
      EP: { selected: EP },
      ER: { selected: ER },
      AV: { selected: AV },
      SE: { selected: SE },
      SC: { selected: SC },
      BP: { selected: BP },
      EX: { selected: EX },
      ML: { selected: ML },
      RP: { selected: RP },
      PL: { selected: PL },
    }
  );

  //getting latest state
  const currentEmployeeRole = await EmployeeRole.findOne({
    _id: ObjectId(roleId),
    userId: ObjectId(req.userId),
    companyId: ObjectId(req.company.id),
  });

  res.status(200).json({
    status: "success",
    data: currentEmployeeRole,
  });
});

//get roles list in either dropdown format or normal format
exports.getRoles = catchAsync(async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 3;
  const mode = req?.query?.mode;
  const totalItems = await EmployeeRole.find({
    userId: ObjectId(req.userId),
    companyId: ObjectId(req.company.id),
  }).countDocuments();
  let employeeRoles = {};
  if (mode === "dropdown") {
    employeeRoles = await EmployeeRole.aggregate([
      {
        $match: {
          userId: ObjectId(req.userId),
          companyId: ObjectId(req.company.id),
        },
      },
      {
        $project: {
          _id: 1,
          roleName: 1,
        },
      },
    ]);
  } else {
    employeeRoles = await EmployeeRole.find({
      userId: ObjectId(req.userId),
      companyId: ObjectId(req.company.id),
    })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
  }
  res.status(200).json({
    status: "success",

    data: employeeRoles,
    totalItems,
  });
});

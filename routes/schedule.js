const express = require("express");
const { body, param, query } = require("express-validator");
const scheduleController = require("./../controllers/schedule");
const authController = require("./../controllers/auth");
const { inputValidator } = require("../utils/inputValidator");
const router = express.Router();

router
  .route("/:scheduleId/timeSlot/:timeSlotId")
  .delete(
    authController.protect,
    authController.protectCompany,
    scheduleController.deleteTimeSlot
  );

router
  .route("/:scheduleId")
  .get(
    authController.protect,
    authController.protectCompany,
    scheduleController.getSchedule
  );

router
  .route("/")
  .get(
    authController.protect,
    authController.protectCompany,
    query("page").isInt({ min: 1 }),
    inputValidator,
    scheduleController.getSchedules
  )
  .post(
    authController.protect,
    authController.protectCompany,
    body("applyBlueprint").isBoolean(),
    body("startDate").matches(
      /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/
    ),
    body("endDate").matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/),
    inputValidator,
    scheduleController.createSchedule
  );

router.route("/:scheduleId/timeSlot").post(
  authController.protect,
  authController.protectCompany,

  body("employeeId").isString(),

  body("day")
    .toLowerCase()
    .custom((value) => {
      const days = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ];
      if (!days.includes(value)) {
        throw new Error("Not a valid day");
      }
      return true;
    }),
  body("startTime").matches(/^(1[012]|[1-9]):[0-5][0-9] (AM|PM)+$/),
  body("endTime").matches(/^(1[012]|[1-9]):[0-5][0-9] (AM|PM)+$/),
  inputValidator,
  scheduleController.insertTimeSlot
);

module.exports = router;

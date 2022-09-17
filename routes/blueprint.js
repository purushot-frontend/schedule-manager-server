const express = require("express");
const { body, param, query } = require("express-validator");
const authController = require("./../controllers/auth");

const blueprintController = require("./../controllers/blueprint");
const { inputValidator } = require("../utils/inputValidator");
const router = express.Router();

router
  .route("/:blueprintId/timeSlot/:timeSlotId")

  .delete(
    authController.protect,
    authController.protectCompany,

    inputValidator,
    blueprintController.deleteTimeSlot
  );

router.route("/:blueprintId/timeSlot").post(
  authController.protect,
  authController.protectCompany,

  body("requiredEmployees")
    .isInt()
    .custom((value) => {
      if (value > 0 && value < 1000) {
        return true;
      } else {
        throw new Error("Required Employees are not in valid range.");
      }
    }),
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
  blueprintController.insertTimeSlot
);
router
  .route("/:blueprintId")
  .get(
    authController.protect,
    authController.protectCompany,
    blueprintController.getBlueprint
  );
router
  .route("/")
  .get(
    authController.protect,
    authController.protectCompany,

    inputValidator,
    blueprintController.getBlueprints
  )
  .post(
    authController.protect,
    authController.protectCompany,
    body("name")
      .trim()
      .not()
      .isEmpty()
      .matches(/^[A-Za-z ]+$/)
      .withMessage("Name should only contains letters."),
    inputValidator,
    blueprintController.createBlueprint
  );
//query("page").isInt({ min: 1 })
module.exports = router;

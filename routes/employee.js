const express = require("express");
const { body, param, query } = require("express-validator");
const router = express.Router();
const employeeController = require("../controllers/employee");
const authController = require("../controllers/auth");
const { inputValidator } = require("../utils/inputValidator");
router
  .route("/")
  .get(
    authController.protect,
    authController.protectCompany,

    inputValidator,
    employeeController.getEmployees
  )
  .post(
    authController.protect,
    authController.protectCompany,
    body("employeeRoleId").trim().not().isEmpty(),
    body("email").isEmail(),
    body("name")
      .trim()
      .not()
      .isEmpty()
      .matches(/^[A-Za-z ]+$/)
      .withMessage("Name should only contains letters."),
    inputValidator,
    employeeController.createEmployee
  );

router.route("/:employeeId").patch(
  authController.protect,
  authController.protectCompany,
  param("employeeId").trim().not().isEmpty(),
  body("employeeRoleId").trim().not().isEmpty(),
  body("name")
    .trim()
    .not()
    .isEmpty()
    .matches(/^[A-Za-z ]+$/)
    .withMessage("Name should only contains letters."),
  inputValidator,
  employeeController.updateEmployee
);

module.exports = router;

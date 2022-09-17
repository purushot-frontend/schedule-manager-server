const express = require("express");
const { body, param, query } = require("express-validator");
const employeeRoleController = require("../controllers/employeeRole");
const authController = require("../controllers/auth");
const { inputValidator } = require("../utils/inputValidator");
const router = express.Router();
/* 
  .get(
    authController.protect,
    authController.protectCompany,
    query("page").isInt(),

    inputValidator,
    employeeRoleController.getRoles
  )
  */
router
  .route("/")
  .get(
    authController.protect,
    authController.protectCompany,

    inputValidator,
    employeeRoleController.getRoles
  )
  .post(
    authController.protect,
    authController.protectCompany,
    body("roleName")
      .trim()
      .not()
      .isEmpty()
      .matches(/^[A-Za-z ]+$/)
      .withMessage(" Role Name should only contains letters."),
    body("LA").isBoolean(),
    body("EP").isBoolean(),
    body("ER").isBoolean(),
    body("AV").isBoolean(),
    body("SE").isBoolean(),
    body("SC").isBoolean(),
    body("BP").isBoolean(),
    body("EX").isBoolean(),
    body("ML").isBoolean(),
    body("RP").isBoolean(),
    body("PL").isBoolean(),

    inputValidator,
    employeeRoleController.createRole
  );

router.route("/:roleId").patch(
  authController.protect,
  authController.protectCompany,
  param("roleId").trim().not().isEmpty(),
  body("LA").isBoolean(),
  body("EP").isBoolean(),
  body("ER").isBoolean(),
  body("AV").isBoolean(),
  body("SE").isBoolean(),
  body("SC").isBoolean(),
  body("BP").isBoolean(),
  body("EX").isBoolean(),
  body("ML").isBoolean(),
  body("RP").isBoolean(),
  body("PL").isBoolean(),

  inputValidator,
  employeeRoleController.updateRole
);

module.exports = router;

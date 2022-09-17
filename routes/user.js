const express = require("express");
const { body, param } = require("express-validator");
const authController = require("../controllers/auth");
const userController = require("../controllers/user");
const { inputValidator } = require("../utils/inputValidator");
const { timeZones } = require("../utils/dateHelper.js");
const router = express.Router();

router.route("/").get(authController.signIn);
router
  .route("/status/:email")
  .get(param("email").isEmail(), inputValidator, userController.getUserStatus);
router
  .route("/signup")
  .post(
    body("email").isEmail(),
    body("password").isLength({ min: 8 }),
    body("fullName").trim().not().isEmpty().escape(),
    inputValidator,
    authController.signUp
  );
router.post(
  "/verifyAccount",
  body("email").isEmail(),
  body("activationToken").trim().not().isEmpty(),
  inputValidator,
  authController.verifyAccount
);
router.route("/signin").post(
  body("email").isEmail(),
  body("password").isLength({ min: 4 }),

  inputValidator,
  authController.signIn
);
//router.post("/forgotPassword", authController.forgotPassword);
router.route("/me").get(authController.protect, userController.getSignedUser);

//user company
router.route("/company").post(
  authController.protect,
  body("companyName")
    .trim()
    .not()
    .isEmpty()
    .matches(/^[A-Za-z ]+$/)
    .withMessage(" Company Name should only contains letters."),
  body("timeZone").custom((value, { req }) => {
    if (!timeZones.map((ele) => ele.value).includes(value)) {
      throw new Error("Not a valid time zone.");
    } // Indicates the success of this synchronous custom validator
    return true;
  }),
  inputValidator,
  userController.createCompany
);
router
  .route("/company/:companyId")
  .get(
    authController.protect,
    param("companyId").trim().not().isEmpty(),
    inputValidator,
    userController.getCompany
  );
router
  .route("/company/:companyId/toggleRenewal")
  .get(
    authController.protect,
    param("companyId").trim().not().isEmpty(),
    inputValidator,
    userController.toggleRenewal
  );

module.exports = router;

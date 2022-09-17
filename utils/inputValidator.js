const { validationResult } = require("express-validator");

//common middleware for catching all input validation errors
exports.inputValidator = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

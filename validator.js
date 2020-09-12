const { check, validationResult } = require("express-validator");
const userValidationRules = () => {
  return [
    check("title", "Title must be at least two characters long").isLength({
      min: 2,
    }),
    check("year", "Year must be four digits long")
      .isLength({ min: 4, max: 4 })
      .isNumeric(),
  ];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  return res
    .status(422)
    .json({ error: errors.array({ onlyFirstError: false }) });
};

module.exports = {
  userValidationRules,
  validate,
};

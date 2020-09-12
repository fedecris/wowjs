const { check, validationResult } = require("express-validator");

const validate = (schemas) => {
  return async (req, res, next) => {
    await Promise.all(schemas.map((schema) => schema.run(req)));

    const result = validationResult(req);
    if (result.isEmpty()) {
      return next();
    }

    return res
      .status(422)
      .json({ error: result.array({ onlyFirstError: false }) });
  };
};

const filmSchema = [
  check("title", "Title must be at least two characters long").isLength({
    min: 2,
  }),
  check("year", "Year must be four digits long")
    .isLength({ min: 4, max: 4 })
    .isNumeric(),
];

module.exports = {
  filmSchema,
  validate,
};

import { body, validationResult } from "express-validator";

export const signinValidation = async (req, res, next) => {
  const rules = [
    body("email").isEmail().withMessage("email is required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .notEmpty()
      .withMessage("password is required"),
  ];

  await Promise.all(rules.map((rule) => rule.run(req)));
  var validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return res.status(400).send({ success: false, msg: validationErrors.array()[0].msg });
  }
  next();
};

import { body, validationResult } from "express-validator";

export const signupValidation = async (req, res, next) => {
  const rules = [
    body("name")
      .isLength({ min: 3 })
      .withMessage("Name should be atlease 3 characters long")
      .notEmpty()
      .withMessage("Name is required"),
    body("email").isEmail().withMessage("email is required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .notEmpty()
      .withMessage("password is required"),
    body("gender")
      .notEmpty()
      .withMessage("gender is required")
      .isIn(["Male", "Female", "Other"])
      .withMessage("Invalid gender. Please choose from Male, Female or Other."),
  ];

  await Promise.all(rules.map((rule) => rule.run(req)));

  var validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return res.status(400).send({ success: false, msg: validationErrors.array()[0].msg });
  } else {
    next();
  }
};
// export default signupValidation;

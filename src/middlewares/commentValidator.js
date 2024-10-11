import { body, validationResult } from "express-validator";

export const commentValidation = async (req, res, next) => {
  const rules = [body("commentText").notEmpty().withMessage("Content is required")];

  await Promise.all(rules.map((rule) => rule.run(req)));

  var validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return res.status(400).send({ success: false, msg: validationErrors.array()[0].msg });
  } else {
    next();
  }
};

import { body, validationResult } from "express-validator";

export const postValidation = async (req, res, next) => {
  const rules = [
    body("caption").notEmpty().withMessage("Caption is required"),
    body("image").custom((value, { req }) => {
      if (!req.file) {
        throw new Error("Image is required");
      } else {
        return true;
      }
    }),
  ];

  await Promise.all(rules.map((rule) => rule.run(req)));
  var validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return res.status(400).send({ success: false, msg: validationErrors.array()[0].msg });
  }
  next();
};

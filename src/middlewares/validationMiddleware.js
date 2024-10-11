import { body, validationResult } from "express-validator";
import { ApplicationError } from "./applicationError.js";
import moment from "moment";

export const validateData = async (req, res, next) => {
  const rules = [
    // body("name")
    //   .optional()
    //   .notEmpty()
    //   .withMessage("Name is requred")
    //   .isLength({ min: 3 })
    //   .withMessage("Name must be atleast 3 character "),

    // body("email").optional().isEmail().withMessage("email is required"),

    // body("password")
    //   .optional()
    //   .notEmpty()
    //   .withMessage("password is required")
    //   .isLength({ min: 6 })
    //   .withMessage("Password must be at least 6 characters long"),

    // profile fields

    // about/,profileImage/,city/,education/,dateOfBirth,gender/,relationshipStatus
    body("about")
      .optional()
      .notEmpty()
      .withMessage("about field can not be empty")
      .isLength({ min: 3 })
      .withMessage("about must be atleast 3 character "),

    body("profileImage").custom((value, { req }) => {
      if (!req.file) {
        throw new ApplicationError("Image is required", 400);
      } else {
        return true;
      }
    }),
    body("city")
      .optional()
      .notEmpty()
      .withMessage("city field can not be empty")
      .isLength({ min: 3 })
      .withMessage("city name must be atleast 3 character "),

    body("education")
      .optional()
      .notEmpty()
      .withMessage("education field can not be empty")
      .isLength({ min: 3 })
      .withMessage("education must be atleast 3 character "),

    body("gender")
      .optional()
      .notEmpty()
      .withMessage("Gender is required")
      .isIn(["male", "female", "other"])
      .withMessage("Invalid gender value. Please choose male, female, or other."),

    body("dateOfBirth")
      .trim()
      .custom((value) => {
        // Use moment.js to validate the date format
        if (!moment(value, "DD-MM-YYYY", true).isValid()) {
          throw new Error('Invalid date format. Please enter date in "DD-MM-YYYY" format.');
        }
        return true;
      })
      .withMessage('Invalid date format. Please enter date in "DD-MM-YYYY" format.'),

    body("relationshipStatus")
      .optional()
      .notEmpty()
      .withMessage("relationshipStatus is required")
      .isIn(["Single", "Married", "In a relationship", "It's complicated"])
      .withMessage("Invalid relationshipStatus value. Please choose from Single, Married, In a relationship, It's complicated."),
  ];

  await Promise.all(rules.map((rule) => rule.run(req)));
  var validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return res.status(400).send({ success: false, msg: validationErrors.array()[0].msg });
  }
  next();
};

import express from "express";
import UserController from "./users.controller.js";
import { signupValidation } from "../../middlewares/signupValidation.js";
import { signinValidation } from "../../middlewares/signinValidation.js";
import { validateData } from "../../middlewares/validationMiddleware.js";
import jwtAuth from "../../middlewares/jwtAuth.js";

const usersRouter = express.Router();

const userController = new UserController();

// userRouter.route("/signup").post(signupValidation, userController.registerNewUser);
usersRouter.route("/signup").post(signupValidation, userController.registerNewUser);
usersRouter.route("/signin").post(signinValidation, userController.loginUser);
usersRouter.route("/logout").get(jwtAuth, userController.logout);

usersRouter.route("/get-details/:userId").get(jwtAuth, userController.getDetails);
usersRouter.route("/get-all-details").get(jwtAuth, userController.getAllUserDetails);
usersRouter.route("/update-details/:userId").put(jwtAuth, validateData, userController.updateProfile);

export default usersRouter;

// "400": {
//             "description": "Name is required"
//           },
//           "400": {
//             "description": "email is required"
//           },
//           "400": {
//             "description": "Password must be at least 8 characters long"
//           },
//           "400": {
//             "description": "password is required"
//           },
//           "400": {
//             "description": "Invalid gender. Please choose from Male, Female or Other."
//           },

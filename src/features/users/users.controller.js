import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import UserRepo from "./users.repository.js";
import { ApplicationError } from "../../middlewares/applicationError.js";

dotenv.config();

const userRepo = new UserRepo();
//
export default class UserController {
  //register new user using {name,email,password} provided by user
  async registerNewUser(req, res) {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password; // hashing will ne done in repository
    const gender = req.body.gender;
    try {
      const existingUser = await userRepo.getOneByEmail(email);
      if (existingUser) {
        return res.status(409).json({ success: false, msg: "Email is already registered", data: null });
      }
      const newUser = await userRepo.register(name, email, password, gender);
      return res.status(201).json({ success: true, msg: "User registered successfully.", data: newUser });
    } catch (err) {
      return res.status(err.code).json({ success: false, err: err.msg, data: null });
    }
  }

  //login user by using email and password credentials
  async loginUser(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    try {
      const user = await userRepo.login(email, password);
      const payload = { userId: user._id, name: user.name, email: user.email };
      const userDataJson = JSON.stringify(payload);
      const secret_key = process.env.SECRET_KEY.toString();
      const token = await jwt.sign(payload, `${secret_key}`, { expiresIn: "1h" });
      // storing userId in "userId" cookie so that we can use it for next steps
      res.cookie("userData", userDataJson, {
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
        secure: true, // Ensures the cookie is sent over HTTPS
        sameSite: "strict", // Prevents CSRF attacks
        maxAge: 3600000, // Expires after 1 hour\
        path: "/",
      });
      return res.status(200).json({ success: true, msg: "Signin successful. Token returned", data: token });
    } catch (err) {
      if (err instanceof ApplicationError) {
        return res.status(err.code).json({ success: false, msg: `${err.message}` });
      }
      return res.status(500).json({ success: false, msg: "Something went wrong while working with database" });
    }
  }

  async logout(req, res) {
    try {
      // Clear the JWT token from the cookie
      res.clearCookie("userData", { path: "/" }); // Ensure the path matches where the cookie was set
      return res.status(200).json({ success: true, msg: "Logged out successfully." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, msg: "An error occurred during logout." });
    }
  }

  // update profile
  async updateProfile(req, res) {
    const userId = req.params.userId;

    // getting signedin userid from userdata stored in cookie.
    const userDataJSON = req.cookies.userData;
    const userData = JSON.parse(userDataJSON);
    const signedInUserId = userData.userId;

    if (userId !== signedInUserId) {
      return res.status(401).json({ success: false, msg: `You are not Authorised to update this profile.` });
    }
    const fieldsToUpdate = ["about", "profileImage", "city", "education", "dateOfBirth", "relationshipStatus"];
    let valuesToUpdate = {};
    try {
      if (req.file) {
        valuesToUpdate["profileImage"] = req.file.path;
      }

      fieldsToUpdate.forEach((field) => {
        if (req.body.hasOwnProperty(field) && field !== "profileImage") {
          valuesToUpdate[field] = req.body[field];
        }
      });

      const updatedUser = await userRepo.updateProfile(valuesToUpdate, userId);
      return res.status(201).json({ success: true, msg: "Profile updated successfully", data: updatedUser });
    } catch (err) {
      if (err instanceof ApplicationError) {
        return res.status(err.code).json({ success: false, msg: `${err.message}` });
      }
      return res.status(500).json({ success: false, msg: "Something went wrong while working with database" });
    }
  }

  async getDetails(req, res) {
    console.log("getdetails called");
    const userId = req.params.userId;
    try {
      const userData = await userRepo.getUserDetails(userId);
      return res.status(200).json({ success: true, msg: "User Data fetched successfully", data: userData });
    } catch (err) {
      if (err instanceof ApplicationError) {
        return res.status(err.code).json({ success: false, msg: `${err.message}` });
      }
      return res.status(500).json({ success: false, msg: "Something went wrong while working with database" });
    }
  }

  async getAllUserDetails(req, res) {
    try {
      const usersData = await userRepo.getAllUserDetails();
      return res.status(200).json({ success: true, msg: "All Users Data fetched successfully", data: usersData });
    } catch (err) {
      if (err instanceof ApplicationError) {
        return res.status(err.code).json({ success: false, msg: `${err.message}` });
      }
      return res.status(500).json({ success: false, msg: "Something went wrong while working with database" });
    }
  }
}

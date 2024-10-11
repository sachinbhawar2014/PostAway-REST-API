import mongoose from "mongoose";
import { userModel } from "./users.schema.js";
import { hashPassword, compareHashedPassword } from "../../utils/hashedpassword.js";
import { ApplicationError } from "../../middlewares/applicationError.js";

export default class UserRepo {
  //check if user with email and password exists in db if exists the returns user and if not then trows err
  async login(email, password) {
    try {
      const user = await this.getOneByEmail(email);
      if (!user) throw new ApplicationError("This email is not registered", 404);

      const isValidCredentials = await compareHashedPassword(password, user.password);
      if (!isValidCredentials) throw new ApplicationError("Invalid credentials", 401);

      return user;
    } catch (err) {
      throw err;
    }
  }

  //register user and add data of user to the database if user already exists then throws err
  async register(name, email, password, gender) {
    try {
      const hashedPassword = await hashPassword(password);

      const existingUser = await userModel.findOne({ email: email });
      if (existingUser) throw new ApplicationError("Email already registered", 409);

      const newUser = new userModel({
        name,
        email,
        password: hashedPassword,
        gender,
      });
      return await newUser.save();
    } catch (err) {
      console.error(err); // Log the error for debugging purposes
      throw err;
    }
  }

  //get user updated/new profile and add data of user profile to the database
  async updateProfile(profileObj, userId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) throw new ApplicationError("Invalid userId", 400);

      const user = await this.getOneById(userId);
      if (!user) throw new ApplicationError("User not found", 404);

      for (let key in profileObj) {
        user.profile[key] = profileObj[key];
      }
      return await user.save();
    } catch (err) {
      throw err;
    }
  }

  // get user details using email
  async getOneByEmail(email) {
    try {
      const userFound = await userModel.findOne({ email: email });
      return userFound;
    } catch (err) {
      throw new ApplicationError("Something went wrong during database Operation", 500);
    }
  }

  async getUserDetails(userId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) throw new ApplicationError("Invalid userId", 400);

      const user = await userModel
        .findById(userId)
        .populate({ path: "profile", select: "profileImage city relationshipStatus" })
        .select("-password", "name", "email", "gender");

      if (!user) throw new ApplicationError("User not found", 404);

      return user;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async getAllUserDetails() {
    try {
      const result = await userModel.aggregate([
        {
          $project: {
            _id: 0,
            name: 1,
            email: 1,
            gender: 1,
            "profile.profileImage": { $ifNull: ["$profile.profileImage", ""] },
            "profile.city": { $ifNull: ["$profile.city", ""] },
            "profile.relationshipStatus": 1,
          },
        },
      ]);
      if (result.length === 0) throw new ApplicationError("Users not found", 404);

      return result;
    } catch (err) {
      throw err;
    }
  }

  async getOneById(userId) {
    try {
      const userFound = userModel.findById(userId);
      return userFound;
    } catch (error) {
      throw new ApplicationError("Something went wrong during database Operation", 500);
    }
  }
}

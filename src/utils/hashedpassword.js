import bcrypt from "bcrypt";
import { ApplicationError, errorHandlerMiddleware } from "../middlewares/applicationError.js";

export const hashPassword = async (password, next) => {
  try {
    const hashedpswd = await bcrypt.hash(password, 12);
    return hashedpswd;
  } catch (error) {
    throw new ApplicationError("encounterd error in hashing password", 400);
  }
};

//
export const compareHashedPassword = async (password, hashPassword, next) => {
  try {
    return await bcrypt.compare(password, hashPassword);
  } catch (error) {
    throw new ApplicationError("encounterd error in comparing hashed password", 400);
  }
};

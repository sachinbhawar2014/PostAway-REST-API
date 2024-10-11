import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { ApplicationError } from "./applicationError.js";

const jwtAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (authHeader) {
    const token = authHeader;
    const secret_key = process.env.SECRET_KEY.toString();
    jwt.verify(token, `${secret_key}`, (err, decoded) => {
      if (err) {
        console.error("JWT verification error:", err);
        throw new ApplicationError("Invalid token", 401);
      } else {
        req.userId = decoded.userId;
        next();
      }
    });
  } else {
    throw new ApplicationError("No token found", 401);
  }
};

export default jwtAuth;

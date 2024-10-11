import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    requestUrl: { type: String, default: "/" },
    userId: { type: String, default: "" },
    error: { type: String, default: "" },
    requestBody: { type: String, default: "" },
  },
  { timestamps: true }
);

export const logModel = mongoose.model("Log", logSchema);

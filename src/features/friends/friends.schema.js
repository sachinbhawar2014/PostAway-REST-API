import mongoose from "mongoose";

const friendsSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["Accepted", "Rejected", "Pending"], default: "Pending" },
  },
  { timestamps: { timestamps: true } }
);

export const friendModel = mongoose.model("Friend", friendsSchema);

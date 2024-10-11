import mongoose from "mongoose";

const likesSchema = new mongoose.Schema(
  {
    //will contain ists won _id
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ownerName: { type: String, trim: true },
    likableId: { type: mongoose.Schema.Types.ObjectId, refPath: "on_model", required: true },
    on_model: { type: String, enum: ["Post", "Comment"] },
    type: { type: String, default: "like" },
  },
  { timestamps: true }
);

export const likesModel = mongoose.model("Like", likesSchema);

// ownerId: ,
// ownerName: ,
// likableId: ,
// on_model: ,
// type: ,

import mongoose from "mongoose";

const usersSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },

    profile: {
      about: { type: String },
      profileImage: { data: Buffer, contentType: String },
      city: { type: String },
      education: { type: String },
      dateOfBirth: { type: Date },

      relationshipStatus: {
        type: String,
        enum: ["Single", "Married", "In a relationship", "It's complicated"],
        default: "Single",
      },

      posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
      comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
      friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      friend_RequestsReceived: [{ type: mongoose.Schema.Types.ObjectId, ref: "Friend" }],
      friend_RequestsSent: [{ type: mongoose.Schema.Types.ObjectId, ref: "Friend" }],
    },
  },
  { timestamps: true }
);

export const userModel = mongoose.model("User", usersSchema);

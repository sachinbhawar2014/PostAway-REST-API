import mongoose from "mongoose";

const commentsSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ownerName: { type: String, trim: true },
    commentText: { type: String, required: true, trim: true },
    commentableId: { type: mongoose.Schema.Types.ObjectId, refPath: "on_model", required: true },
    on_model: { type: String, enum: ["Post", "Comment"], required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Like" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    type: { type: String, default: "comment" },
  },
  { timestamps: true }
);

export const commentsModel = mongoose.model("Comment", commentsSchema);

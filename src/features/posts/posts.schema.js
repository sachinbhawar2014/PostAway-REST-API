import mongoose from "mongoose";

const postsSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ownerName: { type: String, trim: true },
    caption: { type: String, trim: true },
    avatar: { type: String, trim: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Like" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    type: { type: String, default: "post" },
  },
  { timestamps: true }
);

export const postsModel = mongoose.model("Post", postsSchema);

// import mongoose from "mongoose";

// const postsSchema = new mongoose.Schema(
//   {
//     ownerId: { type: mongoose.Schema.Types.ObjectId, required: true },
//     caption: { type: String, trim: true },
//     avatar: { type: String, trim: true },
//     comments: [{ type: mongoose.Schema.Types.ObjectId }],
//   },
//   { timestamps: true }
// );

// export const postsModel = mongoose.model("Post", postsSchema);

import mongoose from "mongoose";
import { postsModel } from "./posts.schema.js";
import { userModel } from "../users/users.schema.js";
import { ApplicationError } from "../../middlewares/applicationError.js";
import { ObjectId } from "mongodb";

export default class PostRepo {
  async getPostByIdRepo(postId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(postId)) throw new ApplicationError("Invalid postId", 400);

      const post = await postsModel.findById(postId);
      if (!post) throw new ApplicationError("post not found", 404);
      const filteredPost = {
        ownerName: post.ownerName,
        caption: post.caption,
        avatar: post.avatar,
      };
      return filteredPost;
    } catch (err) {
      throw err;
    }
  }

  async createPostRepo(signedInUserId, signedInUserName, caption, imagePath) {
    try {
      const newPost = new postsModel({
        ownerId: signedInUserId,
        ownerName: `${signedInUserName}`,
        caption: `${caption}`,
        avatar: `${imagePath}`,
      });
      const savedNewPost = await newPost.save();
      await this.addPostIdtoUserProfile(signedInUserId, savedNewPost._id);
      return savedNewPost;
    } catch (err) {
      throw err;
    }
  }

  async getAllPostsOfUserRepo(userId) {
    try {
      const posts = await postsModel.aggregate([
        { $match: { ownerId: userId } },
        {
          $project: {
            _id: 0,
            ownerId: 0,
          },
        },
      ]);
      if (posts.length == 0) throw new ApplicationError("Post not found.", 404);
      return posts;
    } catch (err) {
      throw err;
    }
  }

  async getAllPostsRepo() {
    try {
      const posts = await postsModel.aggregate([
        {
          $project: {
            _id: 0,
            ownerId: 0,
            type: 0,
          },
        },
      ]);
      if (posts.length == 0) throw new ApplicationError("No Posts found", 404);
      return posts;
    } catch (err) {
      throw err;
    }
  }

  async updatePostRepo(postId, newCaption, newImagePath) {
    try {
      if (!mongoose.Types.ObjectId.isValid(postId)) throw new ApplicationError("Invalid postId", 400);

      const post = await postsModel.findById(postId);
      if (!post) throw new ApplicationError("post not found", 404);

      if (newCaption) post.caption = newCaption;
      if (newImagePath) post.avatar = newImagePath;

      const updatedPost = await post.save();

      return updatedPost;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async deletePostRepo(userId, postId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(postId)) throw new ApplicationError("Invalid postId", 400);

      const post = await postsModel.findById(postId);
      if (!post) throw new ApplicationError("Post not found", 404);

      const result = await postsModel.findByIdAndDelete(postId);
      await this.removePostIdtoUserProfile(userId, postId);
      return result;
    } catch (err) {
      throw err;
    }
  }

  async addPostIdtoUserProfile(userId, postId) {
    try {
      await userModel.findByIdAndUpdate(userId, { $addToSet: { "profile.posts": postId } });
    } catch (err) {
      throw err;
    }
  }

  async removePostIdtoUserProfile(userId, postId) {
    try {
      await userModel.findByIdAndUpdate(userId, { $pull: { "profile.posts": postId } }, { new: true });
    } catch (err) {
      throw err;
    }
  }

  async getNoOfLikes(postId) {
    try {
      const post = await postsModel.findById(postId);
      if (!post) return;
      return await post.likes.length;
    } catch (err) {
      throw err;
    }
  }

  async findPostById(postId) {
    try {
      return await postsModel.findById(postId);
    } catch (err) {
      throw err;
    }
  }
}

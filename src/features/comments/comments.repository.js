import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import { commentsModel } from "./comments.schema.js";
import { ApplicationError } from "../../middlewares/applicationError.js";
import { postsModel } from "../posts/posts.schema.js";

export default class CommentRepo {
  async createCommentRepo(signedInUserId, signedInUserName, commentText, postId, on_model) {
    try {
      if (!mongoose.Types.ObjectId.isValid(postId)) throw new ApplicationError("Invalid postId", 400);

      const post = await postsModel.findById(postId);
      if (!post) throw ApplicationError("Post Not found", 404);

      const newComment = await new commentsModel({
        ownerId: signedInUserId,
        ownerName: signedInUserName,
        commentText,
        commentableId: postId,
        on_model,
      });

      const newCommentSaved = await newComment.save();

      // update post's comment array before returning
      post.comments.push(newCommentSaved._id);
      const updatedPost = await post.save();

      return newCommentSaved;
    } catch (err) {
      throw err;
    }
  }

  async getAllCommentsForPostIdRepo(postId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(postId)) throw new ApplicationError("Invalid postId", 400);

      const post = await postsModel.findById(postId);
      if (!post) throw new ApplicationError("Post not found", 404);

      const comments = await commentsModel
        .find({ commentableId: new ObjectId(postId) })
        .populate("ownerName", "commentText")
        .select("commentText");
      if (comments.length === 0) throw new ApplicationError("No comments found", 404);

      return comments;
    } catch (err) {
      throw err;
    }
  }

  async updateCommentRepo(commentId, signedInUserId, newCommentText) {
    try {
      if (!mongoose.Types.ObjectId.isValid(commentId)) throw new ApplicationError("Invalid commentId", 400);
      const comment = await commentsModel.findById(commentId);
      if (!comment) throw new ApplicationError("Comment not found", 404);

      //only owner of the comment can edit the comment
      if (comment.ownerId.toString() !== signedInUserId.toString())
        throw new ApplicationError("Not Authorised to update this Comment", 401);
      const updatedComment = await commentsModel.findByIdAndUpdate(
        commentId,
        { commentText: newCommentText },
        { new: true }
      );
      return updatedComment;
    } catch (err) {
      throw err;
    }
  }

  async deleteCommentRepo(commentId, signedInUserId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(commentId)) throw new ApplicationError("Invalid commentId", 400);

      const comment = await commentsModel.findById(commentId);
      if (!comment) throw new ApplicationError("Comment not found", 404);

      const post = await postsModel.findById(comment.commentableId);
      if (!post) throw new ApplicationError("Post not found", 404);

      // to delete comment user has to owner of the post or owner of the comment
      if (
        comment.ownerId.toString() == signedInUserId.toString() ||
        post.ownerId.toString() == signedInUserId.toString()
      ) {
        // update post's comments array befor deleting the comment
        const updatedPost = await postsModel.findByIdAndUpdate(
          new ObjectId(post._id),
          { $pull: { comments: comment._id } },
          { new: true }
        );

        // delete the comment
        const updatedComment = await commentsModel.findByIdAndDelete(commentId);

        return updatedComment;
      } else {
        throw new ApplicationError("Not Authorised to delete this Comment", 401);
      }
    } catch (err) {
      throw err;
    }
  }

  async pushCommentIdToPostCommentsArray(commentId, postId) {
    try {
      const updatedPost = await postsModel
        .findByIdAndUpdate(new ObjectId(postId), { $push: { comments: commentId } }, { new: true })
        .populate("ownerName", "caption", "comments");

      return await updatedPost;
    } catch (err) {
      throw err;
    }
  }

  async pullCommentIdFromPostCommentsArray(commentId, postId) {
    try {
      const post = await postsModel
        .findByIdAndUpdate(postId, { $pull: { comments: commentId } }, { new: true })
        .populate("ownerName", "caption", "commnets");
      return post;
    } catch (err) {
      throw err;
    }
  }
}

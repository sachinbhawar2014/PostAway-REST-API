import { ObjectId } from "mongodb";
import CommentRepo from "./comments.repository.js";
import PostRepo from "../posts/posts.repository.js";
import { ApplicationError } from "../../middlewares/applicationError.js";

const commentRepo = new CommentRepo();
const postRepo = new PostRepo();

export default class CommentsController {
  // create comment on the post of which postId is provided in the req.params
  async createComment(req, res) {
    const commentText = req.body.commentText;
    const postId = req.params.postId;

    // getting signedin userID from cookie
    const userDataJSON = req.cookies.userData;
    const userData = JSON.parse(userDataJSON);
    const signedInUserId = new ObjectId(userData.userId);
    const signedInUserName = userData.name;

    try {
      const newComment = await commentRepo.createCommentRepo(
        signedInUserId,
        signedInUserName,
        commentText,
        postId,
        "Post"
      );

      return res.status(201).json({ success: true, msg: "Comment created successfully", data: newComment });
    } catch (err) {
      if (err instanceof ApplicationError) {
        return res.status(err.code).json({ success: false, msg: `${err.message}` });
      }
      return res.status(500).json({ success: false, msg: err.message });
    }
  }

  // get all comments on the post of which postId is provided in the req.params
  async getAllCommentsForPost(req, res) {
    try {
      const postId = req.params.postId;

      const comments = await commentRepo.getAllCommentsForPostIdRepo(postId);

      return res
        .status(200)
        .json({ success: true, msg: "All comments on this post retrieved successfully", data: comments });
    } catch (err) {
      if (err instanceof ApplicationError) {
        return res.status(err.code).json({ success: false, msg: `${err.message}` });
      }
      return res.status(500).json({ success: false, msg: "Something went wrong while working with database" });
    }
  }

  // update comments with commentId only comment owner can update
  async updateComment(req, res) {
    const commentId = req.params.commentId;
    const newCommentText = req.body.newComment;
    // getting signedin userID from cookie
    const userDataJSON = req.cookies.userData;
    const userData = JSON.parse(userDataJSON);
    const signedInUserId = new ObjectId(userData.userId);

    try {
      const updateComment = await commentRepo.updateCommentRepo(commentId, signedInUserId, newCommentText);
      return res.status(200).json({
        success: true,
        msg: "Comment updated successfully",
        data: updateComment,
      });
    } catch (err) {
      if (err instanceof ApplicationError) {
        return res.status(err.code).json({ success: false, msg: `${err.message}` });
      }
      return res.status(500).json({ success: false, msg: "Something went wrong while working with database" });
    }
  }

  async deleteComment(req, res) {
    const commentId = req.params.commentId;

    // getting signedin userID from cookie
    const userDataJSON = req.cookies.userData;
    const userData = JSON.parse(userDataJSON);
    const signedInUserId = new ObjectId(userData.userId);

    try {
      const deletedComment = await commentRepo.deleteCommentRepo(commentId, signedInUserId);
      return res.status(200).json({
        success: true,
        msg: "Comment deleted successfully",
        data: deletedComment,
      });
    } catch (err) {
      if (err instanceof ApplicationError) {
        return res.status(err.code).json({ success: false, msg: `${err.message}` });
      }
      return res.status(500).json({ success: false, msg: "Something went wrong while working with database" });
    }
  }
}

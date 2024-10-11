import express from "express";
import CommentsController from "./comments.controller.js";
import { commentValidation } from "../../middlewares/commentValidator.js";

const commentsRouter = express.Router();

const commentsController = new CommentsController();

commentsRouter.route("/:postId").post(commentValidation, commentsController.createComment);
commentsRouter.route("/:postId").get(commentsController.getAllCommentsForPost);

commentsRouter.route("/:commentId").put(commentsController.updateComment);
commentsRouter.route("/:commentId").delete(commentsController.deleteComment);

export default commentsRouter;

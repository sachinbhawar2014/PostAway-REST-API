import express from "express";
import LikesController from "./likes.controller.js";

const likesRouter = express.Router();
const likesController = new LikesController();

likesRouter.route("/:id").get(likesController.getlikes);
likesRouter.route("/toggle/:id").put(likesController.toggleLike);

export default likesRouter;

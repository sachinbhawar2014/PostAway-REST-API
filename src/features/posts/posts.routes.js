import express from "express";
import PostsController from "./posts.controller.js";
import { upload } from "../../middlewares/fileuploadmiddleware.js";
// import { multerUpload } from "../../middlewares/uploadToCloudinary.js";
const postsRouter = express.Router();

const postsController = new PostsController();

// userRouter.route("/signup").post(signupValidation, userController.registerNewUser);

postsRouter.route("/").post(upload.single("image"), postsController.createPost);
postsRouter.route("/").get(postsController.getAllPostsOfUser);
postsRouter.route("/all").get(postsController.getAllPosts);

postsRouter.route("/:postId").get(postsController.getPost);
postsRouter.route("/:postId").put(upload.single("image"), postsController.updatePost);
postsRouter.route("/:postId").delete(postsController.deletePost);

export default postsRouter;

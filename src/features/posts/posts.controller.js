import PostRepo from "./posts.repository.js";
import { ApplicationError } from "../../middlewares/applicationError.js";
import uploadOnCloudinary from "../../utils/cloudinaryUtility.js";
import { ObjectId } from "mongodb";

const postRepo = new PostRepo();

export default class PostsController {
  async getPost(req, res) {
    const postId = req.params.postId;
    try {
      const post = await postRepo.getPostByIdRepo(postId);
      console.log(post);
      return res.status(200).json({
        success: true,
        msg: "Post retrieved successfully",
        data: post,
      });
    } catch (err) {
      if (err instanceof ApplicationError) {
        return res.status(err.code).json({ success: false, msg: `${err.message}` });
      }
      return res.status(500).json({ success: false, msg: "Something went wrong while working with database" });
    }
  }

  async createPost(req, res) {
    const caption = req.body.caption;
    let localFilePath;
    if (req.file) {
      localFilePath = req.file.path;
      console.log("image path is here", localFilePath);
    }

    // getting signedin userID from cookie
    const userDataJSON = req.cookies.userData;
    const userData = JSON.parse(userDataJSON);
    const signedInUserId = new ObjectId(userData.userId);
    const signedInUserName = userData.name;

    try {
      //file upload on cloudinary
      const imagePath = await uploadOnCloudinary(localFilePath);
      //
      const newPost = await postRepo.createPostRepo(signedInUserId, signedInUserName, caption, imagePath);
      return res.status(201).json({ success: true, msg: "Post created successfully", data: newPost });
    } catch (err) {
      if (err instanceof ApplicationError) {
        return res.status(err.code).json({ success: false, msg: `${err.message}` });
      }
      return res.status(500).json({ success: false, msg: "Something went wrong while working with database" });
    }
  }

  async getAllPostsOfUser(req, res) {
    try {
      // getting signedin userID from cookie
      const userDataJSON = req.cookies.userData;
      const userData = JSON.parse(userDataJSON);
      const signedInUserId = new ObjectId(userData.userId);

      const posts = await postRepo.getAllPostsOfUserRepo(signedInUserId);

      return res
        .status(200)
        .json({ success: true, msg: "All Posts of Logged-in user retrieved successfully", data: posts });
    } catch (err) {
      if (err instanceof ApplicationError) {
        return res.status(err.code).json({ success: false, msg: `${err.message}` });
      }
      return res.status(500).json({ success: false, msg: "Something went wrong while working with database" });
    }
  }

  // get all posts from all users
  async getAllPosts(req, res) {
    try {
      const posts = await postRepo.getAllPostsRepo();
      return res.status(200).json({ success: true, msg: "All Post retrieved successfully", data: posts });
    } catch (err) {
      if (err instanceof ApplicationError) {
        return res.status(err.code).json({ success: false, msg: `${err.message}` });
      }
      return res.status(500).json({ success: false, msg: "Something went wrong while working with database" });
    }
  }

  // update post only if signedinuser is owner of that post
  async updatePost(req, res) {
    const postId = req.params.postId;
    console.log(req.body);
    let newImagePath, newCaption;
    if (req.file) {
      newImagePath = await uploadOnCloudinary(req.file.path);
    }
    if (req.body.caption) {
      newCaption = req.body.caption;
    }

    // getting signedin userID from cookie
    const userDataJSON = req.cookies.userData;
    const userData = JSON.parse(userDataJSON);
    const signedInUserId = new ObjectId(userData.userId);

    try {
      const postToupdate = await postRepo.getPostByIdRepo(postId);

      if (postToupdate.ownerId.toString() != signedInUserId.toString()) {
        return res.status(401).json({ success: false, msg: `You are not Authorised to update this post.` });
      }
      const updatedPost = await postRepo.updatePostRepo(postId, newCaption, newImagePath);
      return res.status(200).json({ success: true, msg: "Post updated successfully", data: updatedPost });
    } catch (err) {
      if (err instanceof ApplicationError) {
        return res.status(err.code).json({ success: false, msg: `${err.message}` });
      }
      return res.status(500).json({ success: false, msg: "Something went wrong while working with database" });
    }
  }

  async deletePost(req, res) {
    const postId = req.params.postId;

    // getting signedin userID from cookie
    const userDataJSON = req.cookies.userData;
    const userData = JSON.parse(userDataJSON);
    const signedInUserId = new ObjectId(userData.userId);

    try {
      const result = await postRepo.deletePostRepo(signedInUserId, postId);
      return res.status(200).json({ success: true, msg: "Post deleted successfully", data: result });
    } catch (err) {
      if (err instanceof ApplicationError) {
        return res.status(err.code).json({ success: false, msg: `${err.message}` });
      }
      return res.status(500).json({ success: false, msg: "Something went wrong while working with database" });
    }
  }

  //   async addPostIdtoUserProfile(req,res)
}

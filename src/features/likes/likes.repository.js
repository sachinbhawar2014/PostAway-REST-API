import { ObjectId } from "mongodb";
import mongoose from "mongoose";

import PostRepo from "../posts/posts.repository.js";
import CommentRepo from "../comments/comments.repository.js";
import { ApplicationError } from "../../middlewares/applicationError.js";
import { likesModel } from "./likes.scema.js";
import { commentsModel } from "../comments/comments.schema.js";
import { postsModel } from "../posts/posts.schema.js";

const postRepo = new PostRepo();
const commentRepo = new CommentRepo();

export default class LikeRepo {
  //return response will be of {on_model: "Post"/"Comment", noOfLikes: 5} or null
  async getlikesRepo(postOrCommentId) {
    let respose = {};
    try {
      //check if the postOrCommentId is valid ObjectId or not
      if (!mongoose.Types.ObjectId.isValid(postOrCommentId))
        throw new ApplicationError("Invalid postId Or CommentId", 400);

      const feature = (await postsModel.findById(postOrCommentId)) || (await commentsModel.findById(postOrCommentId));

      // if neither post nor comment found with PostOrCommentId then return null
      if (!feature) return null;

      if (feature.type == "post") {
        const likesOnPost = await postRepo.getNoOfLikes(postOrCommentId);

        respose.on_model = "Post";
        respose.noOfLikes = likesOnPost;
        return respose;
      }
      if (feature.type == "comment") {
        const likesOnCommnet = await commentRepo.getNoOfLikes(postOrCommentId);

        respose.on_model = "Comment";
        respose.noOfLikes = likesOnCommnet;
        return respose;
      }
    } catch (err) {
      throw err;
    }
  }

  async toggleLikeRepo(signedInUserId, signedInUserName, postOrCommentId) {
    let response = {};
    try {
      //check if the postOrCommentId is valid ObjectId or not
      if (!mongoose.Types.ObjectId.isValid(postOrCommentId))
        throw new ApplicationError("Invalid postId Or Comment Id", 400);

      // if postOrCommentId is valid then finding the post or comment with that id
      const feature = (await postsModel.findById(postOrCommentId)) || (await commentsModel.findById(postOrCommentId));

      // if neither post nor comment found with PostOrCommentId then return null
      if (!feature) return null;

      // if the feature is post then we toggle like in on that post
      if (feature.type == "post") {
        // check if user already liked this post
        const existingLike = await likesModel.findOne({ ownerId: signedInUserId });
        console.log(existingLike);
        // if already liked then we will remove that like from likes array of post and
        if (!existingLike) {
          const newLike = await this.createNewLikeForPostOrComment(
            signedInUserId,
            signedInUserName,
            postOrCommentId,
            "post"
          );
          const updatedPost = await this.linkLikeIdTOPostOrComment(newLike._id, postOrCommentId, "post");

          response.msg = "Post Liked successfully";
          response.data = { newLike: newLike, updatedPost: updatedPost };
          return response;
        } else {
          const updatedPost = await this.removeLikeIdFromPostOrCommentsLikesArray(
            existingLike._id,
            postOrCommentId,
            "post"
          );
          await this.deleteExistingLike(existingLike._id);
          response.msg = "Post Liked toggled successfully";
          response.data = { like: "existing Like Deleted", updatedPost: updatedPost };
          return response;
        }
      }

      // if the feature is comment then we toggle like in on that cooment
      if (feature.type == "comment") {
        // check if user already liked this post
        const existingLike = await likesModel.find({ ownerId: signedInUserId });

        // if already liked then we will remove that like from likes array of post and
        if (!existingLike) {
          const newLike = await this.createNewLikeForPostOrComment(
            signedInUserId,
            signedInUserName,
            postOrCommentId,
            "comment"
          );
          const updatedComment = await this.linkLikeIdTOPostOrComment(newLike._id, postOrCommentId, "comment");

          response.msg = "Comment Liked successfully";
          response.data = { newLike: newLikeSaved, updatedComment: updatedComment };
          return response;
        } else {
          const updatedComment = await this.removeLikeIdFromPostOrCommentsLikesArray(
            existingLike._id,
            postOrCommentId,
            "comment"
          );
          await this.deleteExistingLike(existingLike._id);
          response.msg = "Comment Liked toggled successfully";
          response.data = { like: "existing Like Deleted", updatedComment: updatedComment };
          return response;
        }
      }
    } catch (err) {
      throw err;
    }
  }

  async createNewLikeForPostOrComment(signedInUserId, signedInUserName, postId, on_model) {
    try {
      const newLike = await new likesModel({
        ownerId: signedInUserId,
        ownerName: signedInUserName,
        likableId: new ObjectId(postId),
        on_model: on_model,
      });
      const newLikeSaved = await newLike.save();
      return newLikeSaved;
    } catch (err) {
      throw err;
    }
  }

  async deleteExistingLike(likeId) {
    try {
      await likesModel.findOneAndDelete(likeId);
    } catch (err) {
      throw err;
    }
  }

  async removeLikeIdFromPostOrCommentsLikesArray(likeId, postOrCommentId, type) {
    try {
      if (type == "post") {
        const post = await postsModel.findByIdAndUpdate(
          { _id: postOrCommentId },
          { $pull: { likes: likeId } },
          { new: true, upsert: false }
        );
        const updatedPost = await post.populate("caption", "likes");
        return updatedPost;
      }
      if (type == "comment") {
        const comment = await commentsModel.findByIdAndUpdate(
          { _id: postOrCommentId },
          { $pull: { likes: likeId } },
          { new: true, upsert: false }
        );
        const updatedComment = await comment.populate("commentText", "likes");
        return updatedComment;
      }
    } catch (error) {
      throw error;
    }
  }

  async linkLikeIdTOPostOrComment(likeId, postOrCommentId, type) {
    try {
      if (type == "post") {
        const post = await postsModel.findById(postOrCommentId);
        post.likes.push(likeId);
        return await post.save();
      }
      if (type == "comment") {
        const comment = await commentsModel.findById(postOrCommentId);
        comment.likes.push(likeId);
        return await comment.save();
      }
    } catch (err) {
      throw err;
    }
  }
}

// let respose = {};
//     try {
//       if (!mongoose.Types.ObjectId.isValid(postOrCommentId)) throw new ApplicationError("Invalid post Or Comment Id", 400);

//       // as of now we dont know if postOrComment id is of post or comment. checking the if it is post first
//       const post = postRepo.findPostById(postOrCommentId);
//       if (!post) {
//         // it is not post then checking if it is comment
//         const comment = commentRepo.findCommentById(postOrCommentId);

//         if (!comment) {
//           return; // if it is niether post nor comment then returning null
//         }

//         // if it is comment then creating newLike and adding newLike._id to the likes array of comment
//         const existingLike = await commentsModel.find({ likes: { $in: [likeId] } });
//         if (!existingLike) {
//           const newLike = new likesModel({
//             ownerId: signedInUserId,
//             ownerName: signedInUserName,
//             likableId: new ObjectId(postOrCommentId),
//             on_model: "Comment",
//           });

//           const newLikeSaved = await newLike.save();
//           respose.on_model = "Comment";

//           const commentUpdated = await commentsModel.findOneAndUpdate(
//             postOrCommentId,
//             { $push: { likes: newLike._id } },
//             { new: true }
//           );
//           // update comment i.e. push newly created like _id to comment.likes

//           respose.data = {
//             newLike: newLikeSaved,
//             updatedFeature: commentsModel.findById(commentUpdated._id).populate("type", "commentText", "likes"),
//           };

//           return respose;
//         } else{

//         }
//       }

//       // if it is post then creating newLike and adding newLike._id to the likes array of post
//       const newLike = new likesModel({
//         ownerId: signedInUserId,
//         ownerName: signedInUserName,
//         likableId: new ObjectId(postOrCommentId),
//         on_model: "Post",
//       });
//       const newLikeSaved = await newLike.save();
//       respose.on_model = "Post";

//       // update post i.e. push newly created like _id to post.likes
//       post.likes.push(newLikeSaved._id);
//       const postUpdated = post.save();
//       respose.data = {
//         newLike: newLikeSaved,
//         updatedFeature: postsModel.findById(postUpdated._id).populate("type", "caption", "likes"),
//       };

//       return respose;
//     } catch (err) {
//       throw err;
//     }
//   }

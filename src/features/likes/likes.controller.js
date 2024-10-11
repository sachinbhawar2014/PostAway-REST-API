import { ObjectId } from "mongodb";
import LikeRepo from "./likes.repository.js";
import { ApplicationError } from "../../middlewares/applicationError.js";

const likeRepo = new LikeRepo();

export default class LikesController {
  async getlikes(req, res) {
    const postOrCommentId = req.params.id;
    try {
      const response = await likeRepo.getlikesRepo(postOrCommentId);
      if (!response) return res.status(404).json({ success: false, msg: "No Post or Comment found" });
      return res
        .status(200)
        .json({ success: true, msg: `Likes on ${response.on_model} : ${response.noOfLikes}`, data: response.noOfLikes });
    } catch (err) {
      if (err instanceof ApplicationError) {
        return res.status(err.code).json({ success: false, msg: `${err.message}` });
      }
      return res.status(500).json({ success: false, msg: "Something went wrong while working with database" });
    }
  }

  async toggleLike(req, res) {
    const postOrCommentId = req.params.id;

    // getting signedin userID from cookie
    const userDataJSON = req.cookies.userData;
    const userData = JSON.parse(userDataJSON);
    const signedInUserId = new ObjectId(userData.userId);
    const signedInUserName = userData.name;

    try {
      const response = await likeRepo.toggleLikeRepo(signedInUserId, signedInUserName, postOrCommentId);
      if (!response) return res.status(404).json({ success: false, msg: "No Post or Comment found" });
      return res.status(200).json({ success: true, msg: `${response.msg}`, data: response.data });
    } catch (err) {
      if (err instanceof ApplicationError) {
        return res.status(err.code).json({ success: false, msg: `${err.message}` });
      }
      return res.status(500).json({ success: false, msg: err.message }); // "Something went wrong while working with database" });
    }
  }
}

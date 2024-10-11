import mongoose from "mongoose";

import { userModel } from "../users/users.schema.js";
import FriendRepo from "./friends.repository.js";
import { ApplicationError } from "../../middlewares/applicationError.js";

const friendRepo = new FriendRepo();

export default class FriendRequestController {
  async getFriendsOfUser(req, res) {
    const userId = req.params.userId;
    try {
      const allFriends = await friendRepo.getFriendsOfUserRepo(userId);
      return res
        .status(200)
        .json({ success: true, msg: `All friends of user retrieved successfully`, data: allFriends });
    } catch (err) {
      if (err instanceof ApplicationError) {
        return res.status(err.code).json({ success: false, msg: `${err.message}` });
      }
      return res.status(500).json({ success: false, msg: "Something went wrong while working with database" });
    }
  }

  async getPendingFriendRequest(req, res) {
    try {
      // getting signedin userid from userdata stored in cookie.
      const userDataJSON = req.cookies.userData;
      const userData = JSON.parse(userDataJSON);
      const signedInUserId = mongoose.Types.ObjectId(userData.userId);

      const pendingFriendReq = await friendRepo.getPendingFriendRequestRepo(signedInUserId);
      return res
        .send(200)
        .json({ success: true, msg: "Pending friend request fetched successfully", data: pendingFriendReq });
    } catch (err) {
      if (err instanceof ApplicationError) {
        return res.status(err.code).json({ success: false, msg: `${err.message}` });
      }
      return res.status(500).json({ success: false, msg: "Something went wrong while working with database" });
    }
  }

  async toggleFriendship(req, res) {
    // if other user is friend then unfriend and if other user is not friend then send friend request
    const friendId = req.params.friendId;

    // getting signedin userid from userdata stored in cookie.
    const userDataJSON = req.cookies.userData;
    const userData = JSON.parse(userDataJSON);
    const signedInUserId = mongoose.Types.ObjectId(userData.userId);

    try {
      const response = await friendRepo.toggleFriendshipRepo(signedInUserId, friendId);
    } catch (err) {
      if (err instanceof ApplicationError) {
        return res.status(err.code).json({ success: false, msg: `${err.message}` });
      }
      return res.status(500).json({ success: false, msg: "Something went wrong while working with database" });
    }
  }

  async respondToFriendReq(req, res) {
    const friendId = req.params.friendId;
    const response = req.body.response;

    //
    const userDataJSON = req.cookies.userData;
    const userData = JSON.parse(userDataJSON);
    const signedInUserId = mongoose.Types.ObjectId(userData.userId);

    try {
      if (response == "accept") {
        const result = await friendRepo.acceptFriendRequest(signedInUserId, friendId);
        if (result) {
          return res.status(200).json({ success: true, msg: "Friend request accepted successfully", data: result });
        }
      }
      if (response == "reject") {
        const result = await friendRepo.cancelFriendRequest(signedInUserId, friendId);
        if (result) {
          return res.status(200).json({ success: true, msg: "Friend request deleted successfully", data: result });
        }
      }
      throw new ApplicationError("Response must be accepted or rejected. please enter correct value in res.body", 404);
    } catch (err) {
      if (err instanceof ApplicationError) {
        return res.status(err.code).json({ success: false, msg: `${err.message}` });
      }
      return res.status(500).json({ success: false, msg: "Something went wrong while working with database" });
    }
  }
}

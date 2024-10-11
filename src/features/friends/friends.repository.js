import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import { userModel } from "../users/users.schema.js";
import { ApplicationError } from "../../middlewares/applicationError.js";
import { friendModel } from "./friends.schema.js";

export default class FriendRepo {
  async getFriendsOfUserRepo(userId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) throw new ApplicationError("Invalid userId", 400);

      const user = await userModel.findById(userId);
      if (!user) throw new ApplicationError("User Not Found", 404);

      const friendsIds = user.profile.friends;
      if (friendsIds.length == 0) throw new ApplicationError("No Friends Found", 404);

      const friendsIdsArr = await friendsIds.forEach((id) => mongoose.Types.ObjectId(id));
      const friends = await User.find({ _id: { $in: friendsIdsArr } })
        .select("name email gender profile.profileImage profile.city profile.relationshipStatus")
        .exec();

      return friends;
    } catch (error) {
      throw error;
    }
  }

  async getPendingFriendRequestRepo(userId) {
    try {
      // not validating userId as it is taken from login details so no need

      const pendingFriendReq = await friendModel
        .find({
          to: userId,
          status: "Pending",
        })
        .populate("from", "name email gender profile.profileImage profile.city profile.relationshipStatus")
        .exec();
      if ((pendingFriendReq, length == 0)) return "No pending friend requests";
      return pendingFriends;
    } catch (error) {
      throw error;
    }
  }

  async toggleFriendshipRepo(signedInUserId, friendId) {
    try {
      //
      if (!mongoose.Types.ObjectId.isValid(friendId)) throw new ApplicationError("Invalid friendId", 400);
      const friend = await userModel.findById(friendId);
      if (!friend) throw new ApplicationError("friend Not Found", 404);

      const user = await userModel.findById(signedInUserId);

      //check if there is friendship between signedinuser and friend. if not then check friend req sent or not .
      // if not then send a friend request

      let result = {};

      if (this.isFriendship(user._id, friend._id)) {
        console.log("friendship exists between user and friend. so initiating method unfriend.");
        // if friendship exists then unfriend
        const resp = await this.unfriend(user._id, friend._id);
        if (resp) {
          result.message = "unfriend successfully";
        }
        return result;
      } else {
        // if friend request sent then cancel friend request
        if (this.isFriendRequestSent(user._id, friend._id)) {
          console.log("friend req sent but not yet accepted. so initiating method cancelFriendRequest.");
          const resp = this.cancelFriendRequest(user._id, friend._id);
          if (resp) {
            result.message = "Friend Request cancelled successfully";
          }
          return result;
        } else {
          // if not friendship nor friend req sent then check friend request received. if received friend request then accept it
          if (this.isFriendRequestReceived(user._id, friend._id)) {
            console.log("friend req recieve but not yet accepted. so initiating method acceptFriendRequest.");

            const resp = await this.acceptFriendRequest(user._id, friend._id);
          } else {
            // if not received friend request then send friend request
            console.log("no friendship, no friend Request received. so initiating method sendFriendRequest.");

            result = await this.sendFriendRequest(user._id, friend._id);
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async unfriend(userId, friendId) {
    try {
      let friend_Request =
        (await friendModel.find({ from: userId, to: friendId })) ||
        (await friendModel.find({ from: friendId, to: userId }));

      // remove friend id in the user profiles friends
      const updateUser = await userModel.updateOne({ _id: userId }, { $pull: { "profile.friends": friendId } });

      // remove user id in the friend's profiles friends
      const updateFriend = await userModel.updateOne({ _id: friendId }, { $pull: { "profile.friends": userId } });

      // delete friend request
      const result = await friendModel.findByIdAndDelete(friend_Request._id);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async cancelFriendRequest(userId, friendId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(friendId)) throw new ApplicationError("Invalid friendId", 400);
      const friend = await userModel.findById(friendId);
      if (!friend) throw new ApplicationError("No friend found", 404);

      let friend_Request =
        (await friendModel.find({ from: userId, to: friendId })) ||
        (await friendModel.find({ from: friendId, to: userId }));

      // remove friend id in the user profiles friend_RequestsSent array
      const updateUser = await userModel.updateOne(
        { _id: userId },
        { $pull: { "profile.friend_RequestsSent": friendId } }
      );

      // remove user id in the friend's profiles friend_RequestsReceived array
      const updateFriend = await userModel.updateOne(
        { _id: friendId },
        { $pull: { "profile.friend_RequestsReceived": friendId } }
      );

      // delete friend request
      const result = await friendModel.findByIdAndDelete(friend_Request._id);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async acceptFriendRequest(userId, friendId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(friendId)) throw new ApplicationError("Invalid friendId", 400);
      const friend = await userModel.findById(friendId);
      if (!friend) throw new ApplicationError("No friend found", 404);

      let friend_Request = await friendModel.findOneAndUpdate({ from: friendId, to: userId }, { status: "Accepted" });
      if (!friend_Request) throw new ApplicationError("Friend request might have withdrawn", 410);
      // remove friend id in the user profile.friend_RequestsReceived and add it to friends
      const updatedUser = await userModel.updateOne(
        { _id: userId },
        {
          $addToSet: { "profile.friends": friendId },
          $pull: { "profile.friend_RequestsReceived": friendId },
        }
      );

      // remove user id in the friend's profile.friend_RequestsSent and add it to friends
      const updatedFriend = await userModel.updateOne(
        { _id: friendId },
        {
          $addToSet: { "profile.friends": userId },
          $pull: { "profile.friend_RequestsSent": userId },
        }
      );

      return true;
    } catch (error) {
      throw error;
    }
  }

  async sendFriendRequest(userId, friendId) {
    try {
      const friend_Request = await new friendModel({
        from: userId,
        to: friendId,
      });

      // add friend id in the user profiles friend_RequestsSent array
      const updateUser = await userModel.updateOne(
        { _id: userId },
        { $addToSet: { "profile.friend_RequestsSent": friendId } }
      );

      // add user id in the friend's profiles friend_RequestsReceived array
      const updateFriend = await userModel.updateOne(
        { _id: friendId },
        { $addToSet: { "profile.friend_RequestsReceived": friendId } }
      );

      return await friend_Request.save();
    } catch (error) {
      throw error;
    }
  }

  async isFriendship(userId, friendId) {
    // returs true or false
    try {
      const user = await userModel.findById(userId);
      return await user.profile.friends.some((requestId) => requestId.equals(friendId));
    } catch (error) {
      throw error;
    }
  }
  async isFriendRequestSent(userId, friendId) {
    // returs true or false
    try {
      const user = await userModel.findById(userId);
      return await user.profile.friend_RequestsSent.some((requestId) => requestId.equals(friendId));
    } catch (error) {
      throw error;
    }
  }

  async isFriendRequestReceived(userId, friendId) {
    // returs true or false
    try {
      const user = await userModel.findById(userId);
      return await user.profile.friend_RequestsReceived.some((requestId) => requestId.equals(friendId));
    } catch (error) {
      throw error;
    }
  }
}

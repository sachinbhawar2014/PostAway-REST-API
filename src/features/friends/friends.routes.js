import express from "express";
import FriendRequestController from "./friends.controller.js";

const friendsRouter = express.Router();
const friendRequestController = new FriendRequestController();

friendsRouter.route("/get-friends/:userId").get(friendRequestController.getFriendsOfUser);
friendsRouter.route("/get-pending-requests").get(friendRequestController.getPendingFriendRequest);
friendsRouter.route("/toggle-friendship/:friendId").post(friendRequestController.toggleFriendship);
friendsRouter.route("/response-to-request/:friendId").put(friendRequestController.respondToFriendReq);

// friendsRouter.route("/friend-request-received").get(friendRequestController.getAllFriendRequest);
// friendsRouter.route("/friend-request-sent").get(friendRequestController.getAllSentFriendRequest);
// friendsRouter.route("/send-friend-request/:userId").post(friendRequestController.sendFriendRequest);
// friendsRouter.route("/accept-friend-request/:friendRequestsId").put(friendRequestController.acceptFriendRequest);
// friendsRouter.route("/reject-friend-request/:friendRequestsId").put(friendRequestController.acceptFriendRequest);
// friendsRouter.route("/delete-friend-request/:friendRequestsId").delete(friendRequestController.acceptFriendRequest);

export default friendsRouter;

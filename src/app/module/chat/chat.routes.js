const express = require("express");
const auth = require("../../middleware/auth");
const config = require("../../../config");
const ChatController = require("./chat.controller");

const router = express.Router();

router
  .post("/post-chat", auth(config.auth_level.user), ChatController.postChat)
  .get(
    "/get-chat-messages",
    auth(config.auth_level.user),
    ChatController.getChatMessages
  )
  .get(
    "/get-all-chats",
    auth(config.auth_level.user),
    ChatController.getAllChats
  )
  .patch(
    "/update-message-as-seen",
    auth(config.auth_level.user),
    ChatController.updateMessageAsSeen
  );

module.exports = router;

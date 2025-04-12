const express = require("express");
const auth = require("../../middleware/auth");
const config = require("../../../config");
const ChatController = require("./chat.controller");

const router = express.Router();

router
  .post("/post-chat", auth(config.auth_level.user), ChatController.postChat)
  .get("/get-chat", auth(config.auth_level.user), ChatController.getChat)
  .get(
    "/get-all-chats",
    auth(config.auth_level.user),
    ChatController.getAllChats
  );

module.exports = router;

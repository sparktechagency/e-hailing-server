const ChatService = require("./chat.service");
const sendResponse = require("../../../util/sendResponse");
const catchAsync = require("../../../util/catchAsync");

const postChat = catchAsync(async (req, res) => {
  const result = await ChatService.postChat(req.user, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Chat initiated",
    data: result,
  });
});

const getChat = catchAsync(async (req, res) => {
  const result = await ChatService.getChat(req.user, req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Chat retrieved",
    data: result,
  });
});

const getAllChats = catchAsync(async (req, res) => {
  const result = await ChatService.getAllChats(req.user, req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Chats retrieved",
    data: result,
  });
});

const ChatController = {
  postChat,
  getChat,
  getAllChats,
};

module.exports = ChatController;

const { default: status } = require("http-status");
const Chat = require("./Chat");
const QueryBuilder = require("../../../builder/queryBuilder");
const ApiError = require("../../../error/ApiError");
const validateFields = require("../../../util/validateFields");

const postChat = async (userData, payload) => {
  // Add your logic here
};

const getChat = async (userData, query) => {
  validateFields(query, ["chatId"]);

  const chat = await Chat.findOne({
    _id: query.chatId,
  }).lean();

  if (!chat) throw new ApiError(status.NOT_FOUND, "Chat not found");

  return chat;
};

const getAllChats = async (userData, query) => {
  const chatQuery = new QueryBuilder(Chat.find({}).lean(), query)
    .search([])
    .filter()
    .sort()
    .paginate()
    .fields();

  const [chats, meta] = await Promise.all([
    chatQuery.modelQuery,
    chatQuery.countTotal(),
  ]);

  return {
    meta,
    chats,
  };
};

const ChatService = {
  postChat,
  getChat,
  getAllChats,
};

module.exports = ChatService;

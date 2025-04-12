const { default: status } = require("http-status");
const Chat = require("./Chat");
const QueryBuilder = require("../../../builder/queryBuilder");
const ApiError = require("../../../error/ApiError");
const validateFields = require("../../../util/validateFields");
const postNotification = require("../../../util/postNotification");
const User = require("../user/User");

const postChat = async (userData, payload) => {
  const { userId } = userData;
  const { receiverId } = payload;

  validateFields(payload, ["receiverId"]);

  const [user, receiver, existingChat] = await Promise.all([
    User.findById(userId).lean(),
    User.findById(receiverId).lean(),
    Chat.findOne({
      participants: { $all: [userId, receiverId] },
    }),
  ]);

  if (!user) throw new ApiError(status.NOT_FOUND, "User not found");
  if (!receiver) throw new ApiError(status.NOT_FOUND, "Receiver not found");
  if (existingChat) return existingChat;

  const newChat = await Chat.create({
    participants: [userId, receiverId],
    messages: [],
  });

  postNotification(
    "New message",
    "You have started a new conversation",
    receiverId
  );
  postNotification(
    "New message",
    "You have started a new conversation",
    userId
  );

  return newChat;
};

const getChatMessages = async (userData, query) => {
  validateFields(query, ["chatId"]);

  const chat = await Chat.findOne({
    _id: query.chatId,
  })
    .populate([
      {
        path: "participants",
        select: "name phoneNumber profile_image",
      },
    ])
    .lean();

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
  getChatMessages,
  getAllChats,
};

module.exports = ChatService;

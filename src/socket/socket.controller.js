const { default: status } = require("http-status");
const User = require("../app/module/user/User");
const emitError = require("./emitError");
const socketCatchAsync = require("../util/socketCatchAsync");

const validateUser = socketCatchAsync(async (socket, io, payload) => {
  if (!payload.userId) {
    emitError(
      socket,
      status.BAD_REQUEST,
      "userId is required to connect",
      "disconnect"
    );
    return null;
  }

  const user = await User.findById(payload.userId);
  if (!user) {
    emitError(socket, status.NOT_FOUND, "User not found", "disconnect");
    return null;
  }

  return user;
});

const Controller = {
  validateUser,
};

module.exports = Controller;

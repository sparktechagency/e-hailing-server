const { EnumSocketEvent } = require("../util/enum");
const Controller = require("./socket.controller");

const socketHandlers = async (socket, io) => {
  console.log("Trying to connect");

  const userId = socket.handshake.query.userId;

  const user = await Controller.validateUser(socket, io, { userId });
  if (!user) return;

  socket.join(userId);

  console.log("a user connected", userId);

  socket.on(EnumSocketEvent.DISCONNECT, () => {
    console.log("user disconnected", userId);
  });
};

module.exports = socketHandlers;

const { EnumSocketEvent } = require("../util/enum");
const SocketController = require("./socket.controller");

const socketHandlers = async (socket, io) => {
  console.log("Trying to connect");

  const userId = socket.handshake.query.userId;

  const user = await SocketController.validateUser(socket, io, { userId });
  if (!user) return;

  socket.join(userId);

  console.log(userId, "connected");

  await SocketController.updateOnlineStatus(socket, io, {
    userId,
    isOnline: true,
  });

  socket.on(EnumSocketEvent.REQUEST_TRIP, (payload) => {
    SocketController.requestTrip(socket, io, { ...payload, userId });
  });

  socket.on(EnumSocketEvent.DISCONNECT, () => {
    SocketController.updateOnlineStatus(socket, io, {
      userId,
      isOnline: false,
    });
    console.log(userId, "disconnected");
  });
};

module.exports = socketHandlers;

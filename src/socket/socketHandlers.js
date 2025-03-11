const { EnumSocketStatus } = require("../util/enum");

const socketHandlers = (socket) => {
  console.log("a user connected");

  const userId = socket.handshake.query.id;

  console.log("hit", userId);

  socket.on(EnumSocketStatus.DISCONNECT, () => {
    console.log("user disconnected");
  });
};

module.exports = socketHandlers;

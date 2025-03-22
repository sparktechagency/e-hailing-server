const { default: status } = require("http-status");
const { EnumSocketEvent } = require("../util/enum");

const emitError = (
  socket,
  statusCode = status.INTERNAL_SERVER_ERROR,
  message = "Internal sever error",
  disconnect
) => {
  socket.emit(EnumSocketEvent.SOCKET_ERROR, { status: statusCode, message });

  if (disconnect) {
    console.log("disconnect-----------------", disconnect);
    socket.disconnect(true);
    console.log("disconnected because of error");
  }
};

module.exports = emitError;

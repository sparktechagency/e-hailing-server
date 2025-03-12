const EnumUserRole = {
  USER: "USER",
  DRIVER: "DRIVER",
  ADMIN: "ADMIN",
};

const EnumPaymentType = {
  SUCCEEDED: "succeeded",
  UNPAID: "unpaid",
  TRANSFERRED: "transferred",
  REFUNDED: "refunded",
};

const EnumSocketEvent = {
  CONNECTION: "connection",
  DISCONNECT: "disconnect",
  ERROR: "error",
  START_CHAT: "start_chat",
  SEND_MESSAGE: "send_message",
};

module.exports = {
  EnumUserRole,
  EnumPaymentType,
  EnumSocketEvent,
};

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

const LoginProvider = {
  LOCAL: "local",
  GOOGLE: "google",
  APPLE: "apple",
};

const UserAccountStatus = {
  VERIFIED: "verified",
  UNVERIFIED: "unverified",
};

module.exports = {
  EnumUserRole,
  EnumPaymentType,
  EnumSocketEvent,
  LoginProvider,
  UserAccountStatus,
};

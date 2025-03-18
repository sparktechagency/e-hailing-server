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
  REQUEST_TRIP: "request_trip",
  START_CHAT: "start_chat",
  SEND_MESSAGE: "send_message",
};

const LoginProvider = {
  LOCAL: "local",
  GOOGLE: "google",
  APPLE: "apple",
};

const TripStatus = {
  REQUESTED: "requested",
  ACCEPTED: "accepted",
  ON_THE_WAY: "on_the_way",
  ARRIVED: "arrived",
  PICKED_UP: "picked_up",
  STARTED: "started",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
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
  TripStatus,
  UserAccountStatus,
};

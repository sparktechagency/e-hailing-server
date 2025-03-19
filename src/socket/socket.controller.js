const { default: status } = require("http-status");
const User = require("../app/module/user/User");
const emitError = require("./emitError");
const socketCatchAsync = require("../util/socketCatchAsync");
const validateSocketFields = require("../util/socketValidateFields");
const fareCalculator = require("../util/fareCalculator");
const Trip = require("../app/module/trip/Trip");
const { EnumSocketEvent } = require("../util/enum");

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

const requestTrip = socketCatchAsync(async (socket, io, payload) => {
  validateSocketFields(socket, payload, [
    "pickUpAddress",
    "pickUpLat",
    "pickUpLong",
    "dropOffAddress",
    "dropOffLat",
    "dropOffLong",
    "duration",
    "distance",
  ]);

  const tripData = {
    user: payload.userId,
    pickUpAddress: payload.pickUpAddress,
    pickUpCoordinates: {
      coordinates: [Number(payload.pickUpLong), Number(payload.pickUpLat)],
    },
    dropOffAddress: payload.dropOffAddress,
    dropOffCoordinates: {
      coordinates: [Number(payload.dropOffLong), Number(payload.dropOffLat)],
    },
    duration: Math.ceil(Number(payload.duration)),
    distance: Math.ceil(Number(payload.distance)) / 1000,
    estimatedFare: fareCalculator(payload.duration, payload.distance),
  };

  const trip = await Trip.create(tripData);

  // send trip data to every driver
  socket.emit(EnumSocketEvent.REQUEST_TRIP, trip);
});

const SocketController = {
  validateUser,
  requestTrip,
};

module.exports = SocketController;

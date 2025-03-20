const { default: status } = require("http-status");
const User = require("../app/module/user/User");
const emitError = require("./emitError");
const socketCatchAsync = require("../util/socketCatchAsync");
const validateSocketFields = require("../util/socketValidateFields");
const fareCalculator = require("../util/fareCalculator");
const Trip = require("../app/module/trip/Trip");
const { EnumSocketEvent, EnumUserRole, TripStatus } = require("../util/enum");
const postNotification = require("../util/postNotification");
const { default: mongoose } = require("mongoose");
const emitResult = require("./emitResult");

// track active timeouts for trip cancellation
const tripTimeouts = new Map();

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

const updateOnlineStatus = socketCatchAsync(async (socket, io, payload) => {
  const updatedUser = await User.findByIdAndUpdate(
    payload.userId,
    { isOnline: payload.isOnline },
    { new: true }
  );

  socket.emit(
    EnumSocketEvent.ONLINE_STATUS,
    emitResult({
      statusCode: status.OK,
      success: true,
      message: `You are ${updatedUser.isOnline ? "online" : "offline"}`,
      data: { isOnline: updatedUser.isOnline },
    })
  );
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
  await trip.populate([
    {
      path: "user",
      select: "name phoneNumber profile_image",
    },
  ]);

  socket.emit(
    EnumSocketEvent.TRIP_REQUESTED,
    emitResult({
      statusCode: status.OK,
      success: true,
      message: "Trip requested successfully",
      data: trip,
    })
  );

  postNotification(
    "Trip Requested",
    "Your trip request is sent. Waiting for driver acceptance.",
    trip.user._id
  );

  const availableDrivers = await User.find({
    role: EnumUserRole.DRIVER,
    isOnline: true,
    isAvailable: true,
  }).lean();

  const driverIds = availableDrivers.map((driver) => driver._id.toString());

  driverIds.forEach((driverId) => {
    const driverSocket = payload.activeDrivers.get(driverId);

    if (driverSocket) {
      driverSocket.emit(
        EnumSocketEvent.TRIP_AVAILABLE,
        emitResult({
          statusCode: status.OK,
          success: true,
          message: "Trip available",
          data: trip,
        })
      );
    }
  });

  // timeout handler with transaction support
  const timeoutHandler = async () => {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const currentTrip = await Trip.findById(trip._id)
          .session(session)
          .select("status")
          .lean();

        if (!currentTrip || currentTrip.status !== TripStatus.REQUESTED) return;

        await Trip.updateOne(
          { _id: trip._id },
          {
            status: TripStatus.CANCELLED,
            cancellationReason: ["No driver available"],
          }
        ).session(session);

        socket.emit(
          EnumSocketEvent.TRIP_NO_DRIVER_FOUND,
          emitResult({
            statusCode: status.OK,
            success: true,
            message: "No driver available. Please try again later.",
            data: { tripId: trip._id },
          })
        );

        postNotification(
          "Trip Cancelled",
          "No driver available for your trip request",
          trip.user._id
        );
      });
    } catch (error) {
      console.log(error);
    } finally {
      session.endSession();
      tripTimeouts.delete(trip._id.toString());
    }
  };

  const timeoutRef = setTimeout(timeoutHandler, 1000 * 60 * 3);
  tripTimeouts.set(trip._id.toString(), timeoutRef);
});

const acceptTrip = socketCatchAsync(async (socket, io, payload) => {
  validateSocketFields(socket, payload, ["tripId", "userId"]);

  const { tripId, userId: driverId } = payload;

  const session = await mongoose.startSession();

  try {
    const result = await session.withTransaction(async () => {
      const acceptedTrip = await Trip.findOneAndUpdate(
        { _id: tripId, status: TripStatus.REQUESTED },
        {
          $set: {
            status: TripStatus.ACCEPTED,
            driver: driverId,
          },
          $inc: {
            __V: 1,
          },
        },
        { new: true, session }
      ).populate("user driver");

      if (!acceptedTrip) {
        emitError(socket, status.CONFLICT, "Trip no longer available");
        return null;
      }

      const driver = await User.findByIdAndUpdate(
        driverId,
        { $set: { isAvailable: false } },
        { new: true, session }
      );

      if (!driver) {
        emitError(socket, status.NOT_FOUND, "Driver not found");
        return null;
      }

      return acceptedTrip;
    });

    if (result) {
      const timeoutRef = tripTimeouts.get(result._id.toString());

      if (timeoutRef) {
        clearTimeout(timeoutRef);
        tripTimeouts.delete(result._id.toString());
      }

      io.to(result.user._id.toString()).emit(
        EnumSocketEvent.TRIP_ACCEPTED,
        emitResult({
          statusCode: status.OK,
          success: true,
          message: `${result.driver.name} has accepted your trip`,
          data: result,
        })
      );

      // socket.emit(
      //   EnumSocketEvent.TRIP_ACCEPTED,
      //   emitResult({
      //     statusCode: status.OK,
      //     success: true,
      //     message: `${result.driver.name} has accepted your trip`,
      //     data: result,
      //   })
      // );

      postNotification(
        "Trip Accepted",
        `Driver ${result.driver.name} has accepted your trip`,
        result.user._id
      );
      postNotification(
        "Trip Accepted",
        `You have accepted a trip from ${result.user.name}`,
        result.driver._id
      );
    }
  } catch (error) {
    console.log(error);
  } finally {
    session.endSession();
  }
});

const SocketController = {
  validateUser,
  updateOnlineStatus,
  requestTrip,
  acceptTrip,
};

module.exports = SocketController;

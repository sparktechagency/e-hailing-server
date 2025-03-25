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
    { path: "user", select: "name phoneNumber profile_image" },
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

      socket.emit(
        EnumSocketEvent.TRIP_ACCEPTED,
        emitResult({
          statusCode: status.OK,
          success: true,
          message: `You have accepted a trip from ${result.user.name}`,
          data: result,
        })
      );

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

const updateDriverLocation = socketCatchAsync(async (socket, io, payload) => {
  validateSocketFields(socket, payload, ["tripId", "lat", "long"]);

  const { tripId, lat, long } = payload;

  const updatedTrip = await Trip.findByIdAndUpdate(
    tripId,
    {
      driverCoordinates: {
        coordinates: [Number(long), Number(lat)],
      },
    },
    { new: true, runValidators: true }
  );

  if (!updatedTrip) {
    emitError(socket, status.NOT_FOUND, "Trip not found");
    return null;
  }
  if (!updatedTrip.driver) {
    emitError(socket, status.NOT_FOUND, "This trip has no driver");
    return null;
  }

  await User.findByIdAndUpdate(
    updatedTrip.driver,
    {
      locationCoordinates: {
        coordinates: [Number(long), Number(lat)],
      },
    },
    { new: true, runValidators: true }
  );

  // Broadcast to user (consider throttling in production)
  io.to(updatedTrip.user.toString()).emit(
    EnumSocketEvent.TRIP_DRIVER_LOCATION_UPDATE,
    emitResult({
      statusCode: status.OK,
      success: true,
      message: "Driver location updated",
      data: updatedTrip,
    })
  );

  // Broadcast to driver (consider throttling in production)
  io.to(updatedTrip.driver.toString()).emit(
    EnumSocketEvent.TRIP_DRIVER_LOCATION_UPDATE,
    emitResult({
      statusCode: status.OK,
      success: true,
      message: "Your location updated",
      data: updatedTrip,
    })
  );
});

const updateTripStatus = socketCatchAsync(async (socket, io, payload) => {
  const { tripId, newStatus, duration, distance } = payload || {};

  validateSocketFields(socket, payload, ["tripId", "newStatus"]);

  const allowedNewStatus = [
    TripStatus.ON_THE_WAY,
    TripStatus.ARRIVED,
    TripStatus.PICKED_UP,
    TripStatus.STARTED,
    TripStatus.COMPLETED,
    TripStatus.CANCELLED,
  ];

  const user = await User.findById(payload.userId).select("role");

  if (user.role === EnumUserRole.USER && newStatus !== TripStatus.CANCELLED)
    emitError(
      socket,
      status.FORBIDDEN,
      `Only driver can update trip status to ${newStatus}`
    );

  if (!allowedNewStatus.includes(newStatus))
    emitError(socket, status.BAD_REQUEST, "Invalid status");

  if (newStatus === TripStatus.COMPLETED)
    validateSocketFields(socket, payload, ["duration", "distance"]);

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const updateData = {
        status: newStatus,
        ...(newStatus === TripStatus.STARTED && { tripStartedAt: Date.now() }),
        ...(newStatus === TripStatus.COMPLETED && {
          duration,
          distance,
          tripCompletedAt: Date.now(),
          finalFare: fareCalculator(duration, distance),
        }),
      };
      console.log("updateData=========", updateData);
      // return;

      const updatedTrip = await Trip.findByIdAndUpdate(tripId, updateData, {
        new: true,
        runValidators: true,
        session,
      });
      console.log(updatedTrip.status);
      // Notify relevant parties
      if (!updatedTrip) emitError(socket, status.NOT_FOUND, "Trip not found");

      handleStatusNotifications(io, updatedTrip, newStatus);

      // Handle driver availability changes
      if (newStatus === TripStatus.COMPLETED) {
        await User.findByIdAndUpdate(
          updatedTrip.driver._id,
          {
            isAvailable: true,
          },
          {
            new: true,
            runValidators: true,
            session,
          }
        );
        activeDrivers.set(updatedTrip.driver._id, socket);
      }
    });
  } finally {
    session.endSession();
  }
});

const cancelTrip = async (socket, io, payload) => {
  validateSocketFields(socket, payload, ["tripId", "reason"]);

  const { tripId, reason } = payload;

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const trip = await Trip.findById(tripId)
        .session(session)
        .select("status user driver");

      const updatedTrip = await Trip.findByIdAndUpdate(
        tripId,
        {
          status: TripStatus.CANCELLED,
          cancellationReason: reason,
          cancelledBy: userRole,
          cancelledAt: Date.now(),
        },
        {
          new: true,
          runValidators: true,
          session,
        }
      );

      // Notify both parties
      io.to(trip.user._id).emit(EnumSocketEvent.TRIP_CANCELLED, updatedTrip);

      if (trip.driver) {
        io.to(trip.driver._id).emit(EnumSocketEvent.ca, updatedTrip);

        await User.findByIdAndUpdate(trip.driver._id, { isAvailable: true });

        activeDrivers.set(trip.driver._id, socket);
      }
    });
  } finally {
    session.endSession();
  }
};

// utility functions =====================

const handleStatusNotifications = (io, trip, newStatus) => {
  const eventName = `trip_${newStatus}`;
  const messageMap = {
    [TripStatus.ON_THE_WAY]: {
      rider: "Your driver is on the way",
      driver: "You are on the way to the rider",
    },
    [TripStatus.ARRIVED]: {
      rider: "Your driver has arrived",
      driver: "You have arrived at the pickup location",
    },
    [TripStatus.PICKED_UP]: {
      rider: "You've been picked up",
      driver: "You have picked up the rider",
    },
    [TripStatus.STARTED]: {
      rider: "Your trip has started",
      driver: "The trip has started",
    },
    [TripStatus.COMPLETED]: {
      rider: "Your trip has been completed successfully",
      driver: "You have successfully completed the trip",
    },
    [TripStatus.CANCELLED]: {
      rider: "Your trip has been cancelled",
      driver: "The trip has been cancelled",
    },
  };
  console.log(trip.driver);
  console.log(trip.user);
  // Notify user
  io.to(trip.user.toString()).emit(
    eventName,
    emitResult({
      statusCode: status.OK,
      success: true,
      message: messageMap[newStatus].user,
      data: trip,
    })
  );

  postNotification(`Trip update`, messageMap[newStatus].rider, trip.user);

  // Notify driver
  io.to(trip.driver.toString()).emit(
    eventName,
    emitResult({
      statusCode: status.OK,
      success: true,
      message: messageMap[newStatus].driver,
      data: trip,
    })
  );

  if (trip.driver)
    postNotification(`Trip update`, messageMap[newStatus].driver, trip.driver);
};

const SocketController = {
  validateUser,
  updateOnlineStatus,
  requestTrip,
  acceptTrip,
  updateDriverLocation,
  updateTripStatus,
  cancelTrip,
};

module.exports = SocketController;

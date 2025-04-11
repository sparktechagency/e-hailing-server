const cron = require("node-cron");
const { default: status } = require("http-status");
const { default: mongoose } = require("mongoose");

const User = require("../app/module/user/User");
const emitError = require("./emitError");
const socketCatchAsync = require("../util/socketCatchAsync");
const validateSocketFields = require("../util/socketValidateFields");
const fareCalculator = require("../util/fareCalculator");
const Trip = require("../app/module/trip/Trip");
const { EnumSocketEvent, EnumUserRole, TripStatus } = require("../util/enum");
const postNotification = require("../util/postNotification");
const emitResult = require("./emitResult");
const OnlineSession = require("../app/module/onlineSession/OnlineSession");
const { logger } = require("../util/logger");

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
  const { isOnline } = payload;

  const updatedUser = await User.findByIdAndUpdate(
    payload.userId,
    { isOnline },
    { new: true }
  );

  // start the session if driver is online
  if (updatedUser.role === EnumUserRole.DRIVER && isOnline) {
    await OnlineSession.create({
      driver: updatedUser._id,
      start: new Date(),
    });
  }

  // if driver is offline end the session and calculate the online duration
  if (updatedUser.role === EnumUserRole.DRIVER && !isOnline) {
    const onlineSession = await OnlineSession.findOne({
      driver: updatedUser._id,
      end: { $exists: false },
      duration: { $exists: false },
    }).sort({ createdAt: -1 });

    const end = new Date();
    const duration = end - onlineSession.start;

    onlineSession.end = end;
    onlineSession.duration = duration;
    await onlineSession.save();

    console.log("Online duration:", onlineSession.duration / 1000, "seconds");
  }

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
          trip.user
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
  validateSocketFields(socket, payload, ["tripId", "userId", "lat", "long"]);

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
            driverCoordinates: {
              coordinates: [Number(payload.lat), Number(payload.long)],
            },
          },
          $inc: {
            __V: 1,
          },
        },
        {
          new: true,
          runValidators: true,
          session,
        }
      ).populate("user driver");

      if (!acceptedTrip)
        emitError(socket, status.CONFLICT, "Trip no longer available");

      const driver = await User.findByIdAndUpdate(
        driverId,
        { $set: { isAvailable: false } },
        { new: true, session }
      );

      if (!driver) emitError(socket, status.NOT_FOUND, "Driver not found");

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
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedTrip) emitError(socket, status.NOT_FOUND, "Trip not found");

  if (!updatedTrip.driver)
    emitError(socket, status.NOT_FOUND, "This trip has no driver");

  await User.findByIdAndUpdate(
    updatedTrip.driver,
    {
      locationCoordinates: {
        coordinates: [Number(long), Number(lat)],
      },
    },
    {
      new: true,
      runValidators: true,
    }
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
  const { tripId, newStatus, duration, distance, reason, activeDrivers } =
    payload || {};

  validateSocketFields(socket, payload, ["tripId", "newStatus"]);

  const allowedNewStatus = [
    TripStatus.ON_THE_WAY,
    TripStatus.ARRIVED,
    TripStatus.PICKED_UP,
    TripStatus.STARTED,
    TripStatus.COMPLETED,
    TripStatus.CANCELLED,
  ];

  if (!allowedNewStatus.includes(newStatus))
    emitError(
      socket,
      status.BAD_REQUEST,
      `Invalid status. Valid status are ${allowedNewStatus.join(", ")}`
    );

  if (newStatus === TripStatus.COMPLETED)
    validateSocketFields(socket, payload, ["duration", "distance"]);

  if (newStatus === TripStatus.CANCELLED)
    validateSocketFields(socket, payload, ["reason"]);

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const updateData = {
        status: newStatus,
        ...(newStatus === TripStatus.STARTED && { tripStartedAt: Date.now() }),
        ...(newStatus === TripStatus.CANCELLED && {
          cancellationReason: reason,
        }),
        ...(newStatus === TripStatus.COMPLETED && {
          duration,
          distance,
          tripCompletedAt: Date.now(),
          finalFare: fareCalculator(duration, distance),
        }),
      };

      const updatedTrip = await Trip.findByIdAndUpdate(tripId, updateData, {
        new: true,
        runValidators: true,
        session,
      });

      // Notify relevant parties
      if (!updatedTrip) emitError(socket, status.NOT_FOUND, "Trip not found");

      handleStatusNotifications(io, updatedTrip, newStatus);

      // Update driver availability for trip completion and cancellation
      if (
        [TripStatus.COMPLETED, TripStatus.CANCELLED].includes(newStatus) &&
        updatedTrip.driver
      ) {
        const updateData = {
          isAvailable: true,
          ...(newStatus === TripStatus.CANCELLED && {
            cancellationReason: reason,
          }),
        };

        await User.findByIdAndUpdate(updatedTrip.driver, updateData, {
          new: true,
          runValidators: true,
          session,
        });

        activeDrivers.set(updatedTrip.driver.toString(), socket);
      }
    });
  } catch (error) {
    console.log(error);
  } finally {
    session.endSession();
  }
});

// utility functions =====================

const handleStatusNotifications = (io, trip, newStatus) => {
  const eventName = EnumSocketEvent.TRIP_UPDATE_STATUS;
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

  // Notify user
  io.to(trip.user.toString()).emit(
    eventName,
    emitResult({
      statusCode: status.OK,
      success: true,
      message: messageMap[newStatus].rider,
      data: trip,
    })
  );

  postNotification(`Trip update`, messageMap[newStatus].rider, trip.user);

  // Notify driver if any
  if (trip.driver) {
    io.to(trip.driver.toString()).emit(
      eventName,
      emitResult({
        statusCode: status.OK,
        success: true,
        message: messageMap[newStatus].driver,
        data: trip,
      })
    );

    postNotification(`Trip update`, messageMap[newStatus].driver, trip.driver);
  }
};

const removeStaleOnlineSessions = async () => {
  try {
    console.log("hit every hour", new Date().toLocaleString());

    const result = await OnlineSession.deleteMany({
      duration: { $exists: false },
    });

    if (result.deletedCount > 0)
      logger.info(
        `Removed ${result.deletedCount} OnlineSessions without a duration`,
        new Date().toLocaleString()
      );
  } catch (error) {
    logger.error("⌚ Error removing OnlineSessions", error);
  }
};

// Schedule a cron job to run at midnight every day for removing OnlineSessions without a duration field
cron.schedule("0 0 * * *", removeStaleOnlineSessions);

const SocketController = {
  validateUser,
  updateOnlineStatus,
  requestTrip,
  acceptTrip,
  updateDriverLocation,
  updateTripStatus,
};

module.exports = SocketController;

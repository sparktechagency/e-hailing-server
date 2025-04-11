const { default: status } = require("http-status");
const Trip = require("./Trip");
const QueryBuilder = require("../../../builder/queryBuilder");
const ApiError = require("../../../error/ApiError");
const validateFields = require("../../../util/validateFields");
const { EnumUserRole, EnumPaymentType } = require("../../../util/enum");
const OnlineSession = require("../onlineSession/OnlineSession");

const getTrip = async (userData, query) => {
  validateFields(query, ["tripId"]);

  const trip = await Trip.findOne({
    _id: query.tripId,
  })
    .populate([
      {
        path: "user",
        select: "-_id -authId -createdAt -updatedAt -__v",
      },
      {
        path: "driver",
        select: "profile_image name email",
      },
      {
        path: "car",
        select: "-createdAt -updatedAt -__v",
      },
    ])
    .lean();

  if (!trip) throw new ApiError(status.NOT_FOUND, "Trip not found");

  return trip;
};

const getAllTrips = async (userData, query) => {
  /**
   * Retrieves a list of trips based on user role and query parameters.
   * - If the user is an **admin**, fetches all trips.
   * - Otherwise, fetches trips associated with the user or driver.
   */
  const tripQuery = new QueryBuilder(
    Trip.find({
      ...(userData.role === !EnumUserRole.ADMIN && { user: userData.userId }),
    })
      .populate([
        {
          path: "user",
          select: "name profile_image",
        },
        {
          path: "driver",
          select: "name profile_image",
        },
      ])
      .lean(),
    query
  )
    .search(["status", "cancellationReason", "dropOffAddress", "pickUpAddress"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const [trips, meta] = await Promise.all([
    tripQuery.modelQuery,
    tripQuery.countTotal(),
  ]);

  return {
    meta,
    trips,
  };
};

const deleteTrip = async (userData, payload) => {
  validateFields(payload, ["tripId"]);

  const trip = await Trip.deleteOne({
    _id: payload.tripId,
  });

  if (!trip.deletedCount)
    throw new ApiError(status.NOT_FOUND, "Trip not found");

  return trip;
};

const updateTollFee = async (userData, payload) => {
  // Updates the toll fee of a trip by adding the provided tollFee to the existing one.
  validateFields(payload, ["tripId", "tollFee"]);

  const trip = await Trip.findById(payload.tripId).lean();
  if (!trip) throw new ApiError(status.NOT_FOUND, "Trip not found");

  const newTollFee = Math.max(0, trip.tollFee + Number(payload.tollFee));

  const updatedTrip = await Trip.findOneAndUpdate(
    { _id: payload.tripId },
    { tollFee: newTollFee },
    { new: true }
  );

  return updatedTrip;
};

const getTripStatistics = async (userData, query) => {
  const activeHours = "";

  const { filter = "all-time" } = query;
  const dateFilter = getTimeRange(filter.toLowerCase().trim());

  const matchStage = {
    // status: TripStatus.COMPLETED,
    // ...(userData.role !== EnumUserRole.ADMIN && { driver: userData.userId }),
  };

  if (Object.keys(dateFilter).length > 0)
    matchStage.tripCompletedAt = dateFilter;

  const stats = await Trip.aggregate([
    { $match: matchStage },
    {
      $facet: {
        totalEarnings: [
          {
            $group: { _id: null, total: { $sum: "$finalFare" } },
          },
        ],
        earningsByCash: [
          {
            $match: { paymentType: EnumPaymentType.CASH },
          },
          {
            $group: { _id: null, total: { $sum: "$finalFare" } },
          },
        ],
        earningsByCoin: [
          {
            $match: { paymentType: EnumPaymentType.COIN },
          },
          {
            $group: { _id: null, total: { $sum: "$finalFareInCoins" } },
          },
        ],
        totalTrips: [
          {
            $count: "count",
          },
        ],
        totalDistance: [
          {
            $group: { _id: null, total: { $sum: "$distance" } },
          },
        ],
      },
    },
  ]);

  const result = await OnlineSession.aggregate([
    {
      $match: {
        createdAt: dateFilter,
      },
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: {
            $divide: ["$duration", 1000 * 60], // convert ms to minutes
          },
        },
      },
    },
  ]);

  const format = (arr) => (arr[0] ? arr[0].total || arr[0].count : 0);

  return {
    totalEarn: format(stats[0].totalEarnings),
    cash: format(stats[0].earningsByCash),
    coin: format(stats[0].earningsByCoin),
    numberOfTrips: format(stats[0].totalTrips),
    tripDistance: format(stats[0].totalDistance),
    activeHours: format(result),
  };
};

// utility functions ==================
const getTimeRange = (filter) => {
  const now = new Date();
  let startDate = null;

  const allowedFilters = [
    "today",
    "last-7-days",
    "this-month",
    "this-year",
    "all-time",
  ];

  if (!allowedFilters.includes(filter)) {
    throw new ApiError(
      status.BAD_REQUEST,
      `Invalid filter. Allowed values: ${allowedFilters.join(", ")}`
    );
  }

  switch (filter) {
    case "today":
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case "last-7-days":
      startDate = new Date(now.setDate(now.getDate() - 6));
      break;
    case "this-month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "this-year":
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case "all-time":
      return {}; // No filter for all time
  }

  return { $gte: startDate };
};

const TripService = {
  getTrip,
  getAllTrips,
  deleteTrip,
  updateTollFee,
  getTripStatistics,
};

module.exports = TripService;

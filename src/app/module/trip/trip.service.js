const { default: status } = require("http-status");
const Trip = require("./Trip");
const QueryBuilder = require("../../../builder/queryBuilder");
const ApiError = require("../../../error/ApiError");
const validateFields = require("../../../util/validateFields");
const { EnumUserRole } = require("../../../util/enum");

const getTrip = async (userData, query) => {
  console.log(query);
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

const TripService = {
  getTrip,
  getAllTrips,
  deleteTrip,
};

module.exports = TripService;

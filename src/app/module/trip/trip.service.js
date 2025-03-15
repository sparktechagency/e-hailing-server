const { default: status } = require("http-status");
const Trip = require("./Trip");
const QueryBuilder = require("../../../builder/queryBuilder");
const ApiError = require("../../../error/ApiError");
const validateFields = require("../../../util/validateFields");

const postTrip = async (userData, payload) => {
  // Add your logic here
};

const getTrip = async (userData, query) => {
  validateFields(query, ["tripId"]);

  const trip = await Trip.findOne({
    _id: query.tripId,
  }).lean();

  if (!trip) throw new ApiError(status.NOT_FOUND, "Trip not found");

  return trip;
};

const getAllTrips = async (userData, query) => {
  const tripQuery = new QueryBuilder(Trip.find({}).lean(), query)
    .search([])
    .filter()
    .sort()
    .paginate()
    .fields();

  const [trip, meta] = await Promise.all([
    tripQuery.modelQuery,
    tripQuery.countTotal(),
  ]);

  return {
    meta,
    trips,
  };
};

const updateTrip = async (userData, payload) => {
  // Add your logic here
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
  postTrip,
  getTrip,
  getAllTrips,
  updateTrip,
  deleteTrip,
};

module.exports = TripService;

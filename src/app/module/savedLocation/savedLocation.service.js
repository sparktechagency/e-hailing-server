const { default: status } = require("http-status");
const SavedLocation = require("./SavedLocation");
const QueryBuilder = require("../../../builder/queryBuilder");
const ApiError = require("../../../error/ApiError");
const validateFields = require("../../../util/validateFields");

const postSavedLocation = async (userData, payload) => {
  validateFields(payload, [
    "locationName",
    "locationAddress",
    "longitude",
    "latitude",
  ]);

  const lat = Number(payload.latitude);
  const long = Number(payload.longitude);

  const savedLocationData = {
    user: userData.userId,
    locationName: payload.locationName,
    locationAddress: payload.locationAddress,
    location: {
      type: "Point",
      coordinates: [long, lat],
    },
  };

  const savedLocation = await SavedLocation.create(savedLocationData);

  return savedLocation;
};

const getSavedLocation = async (userData, query) => {
  validateFields(query, ["savedLocationId"]);

  const savedLocation = await SavedLocation.findOne({
    _id: query.savedLocationId,
  }).lean();

  if (!savedLocation)
    throw new ApiError(status.NOT_FOUND, "Saved Location not found");

  return savedLocation;
};

const getMySavedLocations = async (userData, query) => {
  const savedLocationQuery = new QueryBuilder(
    SavedLocation.find({ user: userData.userId }).lean(),
    query
  )
    .search([])
    .filter()
    .sort()
    .paginate()
    .fields();

  const [result, meta] = await Promise.all([
    savedLocationQuery.modelQuery,
    savedLocationQuery.countTotal(),
  ]);

  return {
    meta,
    result,
  };
};

const deleteSavedLocation = async (userData, payload) => {
  validateFields(payload, ["savedLocationId"]);

  const savedLocation = await SavedLocation.deleteOne({
    _id: payload.savedLocationId,
  });

  if (!savedLocation.deletedCount)
    throw new ApiError(status.NOT_FOUND, "Saved Location not found");

  return savedLocation;
};

const SavedLocationService = {
  postSavedLocation,
  getSavedLocation,
  getMySavedLocations,
  deleteSavedLocation,
};

module.exports = SavedLocationService;

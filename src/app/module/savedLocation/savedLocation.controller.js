const SavedLocationService = require("./savedLocation.service");
const sendResponse = require("../../../util/sendResponse");
const catchAsync = require("../../../util/catchAsync");

const postSavedLocation = catchAsync(async (req, res) => {
  const result = await SavedLocationService.postSavedLocation(
    req.user,
    req.body
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "SavedLocation created",
    data: result,
  });
});

const getSavedLocation = catchAsync(async (req, res) => {
  const result = await SavedLocationService.getSavedLocation(
    req.user,
    req.query
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "SavedLocation retrieved",
    data: result,
  });
});

const getMySavedLocations = catchAsync(async (req, res) => {
  const result = await SavedLocationService.getMySavedLocations(
    req.user,
    req.query
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "SavedLocations retrieved",
    data: result,
  });
});

const deleteSavedLocation = catchAsync(async (req, res) => {
  const result = await SavedLocationService.deleteSavedLocation(
    req.user,
    req.body
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "SavedLocation deleted",
    data: result,
  });
});

const SavedLocationController = {
  postSavedLocation,
  getSavedLocation,
  getMySavedLocations,
  deleteSavedLocation,
};

module.exports = SavedLocationController;

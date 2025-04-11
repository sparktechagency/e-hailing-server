const TripService = require("./trip.service");
const sendResponse = require("../../../util/sendResponse");
const catchAsync = require("../../../util/catchAsync");

const getTrip = catchAsync(async (req, res) => {
  const result = await TripService.getTrip(req.user, req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Trip retrieved",
    data: result,
  });
});

const getAllTrips = catchAsync(async (req, res) => {
  const result = await TripService.getAllTrips(req.user, req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Trips retrieved",
    data: result,
  });
});

const deleteTrip = catchAsync(async (req, res) => {
  const result = await TripService.deleteTrip(req.user, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Trip deleted",
    data: result,
  });
});

const updateTollFee = catchAsync(async (req, res) => {
  const result = await TripService.updateTollFee(req.user, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Toll fee updated",
    data: result,
  });
});

const getTripStatistics = catchAsync(async (req, res) => {
  const result = await TripService.getTripStatistics(req.user, req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Trip statistics retrieved",
    data: result,
  });
});

const TripController = {
  getTrip,
  getAllTrips,
  deleteTrip,
  updateTollFee,
  getTripStatistics,
};

module.exports = TripController;

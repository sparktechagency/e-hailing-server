const TripService = require("./trip.service");
const sendResponse = require("../../../util/sendResponse");
const catchAsync = require("../../../util/catchAsync");

const postTrip = catchAsync(async (req, res) => {
  const result = await TripService.postTrip(req.user, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Trip created",
    data: result,
  });
});

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

const updateTrip = catchAsync(async (req, res) => {
  const result = await TripService.updateTrip(req.user, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Trip updated",
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

const TripController = {
  postTrip,
  getTrip,
  getAllTrips,
  updateTrip,
  deleteTrip,
};

module.exports = TripController;

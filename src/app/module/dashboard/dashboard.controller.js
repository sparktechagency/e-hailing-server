const catchAsync = require("../../../util/catchAsync");
const sendResponse = require("../../../util/sendResponse");
const DashboardService = require("./dashboard.service");

// overview ========================

const totalOverview = catchAsync(async (req, res) => {
  const result = await DashboardService.totalOverview();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Total overview retrieved successfully",
    data: result,
  });
});

const revenue = catchAsync(async (req, res) => {
  const result = await DashboardService.revenue(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Revenue retrieved successfully",
    data: result,
  });
});

const growth = catchAsync(async (req, res) => {
  const result = await DashboardService.growth(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Growth retrieved successfully",
    data: result,
  });
});

// driver management  ==================

const postDriver = catchAsync(async (req, res) => {
  const result = await DashboardService.postDriver(req);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Driver added successfully",
    data: result,
  });
});

const getDriver = catchAsync(async (req, res) => {
  const result = await DashboardService.getDriver(req.user);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Driver retrieved successfully",
    data: result,
  });
});

const getAllDriversOrUsers = catchAsync(async (req, res) => {
  const result = await DashboardService.getAllDriversOrUsers(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `${req.query.role} retrieved successfully`,
    data: result,
  });
});

const editDriver = catchAsync(async (req, res) => {
  const result = await DashboardService.editDriver(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Driver updated successfully",
    data: result,
  });
});

const getUserTripStats = catchAsync(async (req, res) => {
  const result = await DashboardService.getUserTripStats(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User trip statistics retrieved successfully",
    data: result,
  });
});

const DashboardController = {
  totalOverview,
  revenue,
  growth,
  postDriver,
  getDriver,
  getAllDriversOrUsers,
  editDriver,
  getUserTripStats,
};

module.exports = DashboardController;

const CarService = require("./car.service");
const sendResponse = require("../../../util/sendResponse");
const catchAsync = require("../../../util/catchAsync");

const postCar = catchAsync(async (req, res) => {
  const result = await CarService.postCar(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Car created",
    data: result,
  });
});

const getCar = catchAsync(async (req, res) => {
  const result = await CarService.getCar(req.user, req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Car retrieved",
    data: result,
  });
});

const getAllCars = catchAsync(async (req, res) => {
  const result = await CarService.getAllCars(req.user, req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Cars retrieved",
    data: result,
  });
});

const updateCar = catchAsync(async (req, res) => {
  const result = await CarService.updateCar(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Car updated",
    data: result,
  });
});

const updateAssignCarToDriver = catchAsync(async (req, res) => {
  const result = await CarService.updateAssignCarToDriver(req.user, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Car assigned",
    data: result,
  });
});

const deleteCar = catchAsync(async (req, res) => {
  const result = await CarService.deleteCar(req.user, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Car deleted",
    data: result,
  });
});

const CarController = {
  postCar,
  getCar,
  getAllCars,
  updateCar,
  updateAssignCarToDriver,
  deleteCar,
};

module.exports = CarController;

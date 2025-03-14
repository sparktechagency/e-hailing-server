const { default: status } = require("http-status");
const Car = require("./Car");
const QueryBuilder = require("../../../builder/queryBuilder");
const ApiError = require("../../../error/ApiError");
const validateFields = require("../../../util/validateFields");
const postNotification = require("../../../util/postNotification");
const unlinkFile = require("../../../util/unlinkFile");
const processFileUpdates = require("../../../util/processFileUpdates");

const postCar = async (req) => {
  validateFields(req, ["files", "body"]);

  const { body: payload, files } = req;

  validateFields(files, [
    "car_image",
    "car_grant_image",
    "car_insurance_image",
    "e_hailing_car_permit_image",
  ]);
  validateFields(payload, [
    "brand",
    "model",
    "type",
    "seats",
    "evpNumber",
    "evpExpiry",
    "carNumber",
    "color",
    "carLicensePlate",
    "vin",
    "registrationDate",
  ]);

  const carData = {
    brand: payload.brand,
    model: payload.model,
    type: payload.type,
    seats: payload.seats,
    evpNumber: payload.evpNumber,
    evpExpiry: payload.evpExpiry,
    carNumber: payload.carNumber,
    color: payload.color,
    carLicensePlate: payload.carLicensePlate,
    vin: payload.vin,
    registrationDate: payload.registrationDate,
    car_image: files.car_image.map((file) => file.path),
    car_grant_image: files.car_grant_image[0].path,
    car_insurance_image: files.car_insurance_image[0].path,
    e_hailing_car_permit_image: files.e_hailing_car_permit_image[0].path,
  };

  const car = await Car.create(carData);

  postNotification("Car created", "A new car has been added to DuDu");

  return car;
};

const getCar = async (userData, query) => {
  validateFields(query, ["carId"]);

  const car = await Car.findOne({
    _id: query.carId,
  }).lean();

  if (!car) throw new ApiError(status.NOT_FOUND, "Car not found");

  return car;
};

const getAllCars = async (userData, query) => {
  const carQuery = new QueryBuilder(Car.find({}).lean(), query)
    .search([])
    .filter()
    .sort()
    .paginate()
    .fields();

  const [car, meta] = await Promise.all([
    carQuery.modelQuery,
    carQuery.countTotal(),
  ]);

  return {
    meta,
    cars,
  };
};

// update the fields in the car and also update the images and unlink the old images
const updateCar = async (req) => {
  const { body: payload, files = {} } = req || {};

  validateFields(payload, ["carId"]);

  const car = await Car.findById(payload.carId).lean();
  if (!car) throw new ApiError(status.NOT_FOUND, "Car not found");

  const fileFields = [
    { key: "car_image", oldPath: car.car_image }, // array of images
    { key: "car_grant_image", oldPath: car.car_grant_image },
    { key: "car_insurance_image", oldPath: car.car_insurance_image },
    {
      key: "e_hailing_car_permit_image",
      oldPath: car.e_hailing_car_permit_image,
    },
  ];

  const fileUpdates = processFileUpdates(files, fileFields);
  const updateData = { ...payload, ...fileUpdates, carId: undefined };

  const updatedCar = await Car.findByIdAndUpdate(payload.carId, updateData, {
    new: true,
  }).lean();

  postNotification(
    "Car updated",
    `A car has been updated in DuDu. Car ID: ${payload.carId}`
  );

  return updatedCar;
};

const deleteCar = async (userData, payload) => {
  validateFields(payload, ["carId"]);

  const car = await Car.deleteOne({
    _id: payload.carId,
  });

  if (!car.deletedCount) throw new ApiError(status.NOT_FOUND, "Car not found");

  return car;
};

const CarService = {
  postCar,
  getCar,
  getAllCars,
  updateCar,
  deleteCar,
};

module.exports = CarService;

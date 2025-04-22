const express = require("express");
const auth = require("../../middleware/auth");
const config = require("../../../config");
const CarController = require("./car.controller");
const { uploadFile } = require("../../middleware/fileUploader");

const router = express.Router();

router
  .post(
    "/post-car",
    uploadFile(),
    auth(config.auth_level.user),
    CarController.postCar
  )
  .get("/get-car", auth(config.auth_level.user), CarController.getCar)
  .get("/get-all-cars", auth(config.auth_level.user), CarController.getAllCars)
  .patch(
    "/update-car",
    uploadFile(),
    auth(config.auth_level.user),
    CarController.updateCar
  )
  .patch(
    "/update-assign-car-to-driver",
    auth(config.auth_level.admin),
    CarController.updateAssignCarToDriver
  )
  .delete(
    "/delete-car",
    auth(config.auth_level.admin),
    CarController.deleteCar
  );

module.exports = router;

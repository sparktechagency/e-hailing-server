const express = require("express");
const auth = require("../../middleware/auth");
const config = require("../../../config");
const CarController = require("./car.controller");

const router = express.Router();

router
  .post("/post-car", auth(config.auth_level.user), CarController.postCar)
  .get("/get-car", auth(config.auth_level.user), CarController.getCar)
  .get("/get-all-cars", auth(config.auth_level.user), CarController.getAllCars)
  .patch("/update-car", auth(config.auth_level.user), CarController.getAllCars)
  .delete("/delete-car", auth(config.auth_level.user), CarController.deleteCar);

module.exports = router;

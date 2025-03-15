const express = require("express");
const auth = require("../../middleware/auth");
const config = require("../../../config");
const TripController = require("./trip.controller");

const router = express.Router();

router
  .post("/post-trip", auth(config.auth_level.user), TripController.postTrip)
  .get("/get-trip", auth(config.auth_level.user), TripController.getTrip)
  .get(
    "/get-all-trips",
    auth(config.auth_level.user),
    TripController.getAllTrips
  )
  .patch(
    "/update-trip",
    auth(config.auth_level.user),
    TripController.updateTrip
  )
  .delete(
    "/delete-trip",
    auth(config.auth_level.user),
    TripController.deleteTrip
  );

module.exports = router;

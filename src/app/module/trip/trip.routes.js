const express = require("express");
const auth = require("../../middleware/auth");
const config = require("../../../config");
const TripController = require("./trip.controller");

const router = express.Router();

router
  .get("/get-trip", auth(config.auth_level.user), TripController.getTrip)
  .get(
    "/get-all-trips",
    auth(config.auth_level.user),
    TripController.getAllTrips
  )
  .delete(
    "/delete-trip",
    auth(config.auth_level.admin),
    TripController.deleteTrip
  )
  .patch(
    "/update-toll-fee",
    auth(config.auth_level.driver),
    TripController.updateTollFee
  )
  .get(
    "/get-trip-statistics",
    auth(config.auth_level.driver),
    TripController.getTripStatistics
  )

  // Peak hour routes =========================
  .get(
    "/get-peak-hours",
    auth(config.auth_level.user),
    TripController.getPeakHours
  )
  .patch(
    "/post-time-range",
    auth(config.auth_level.admin),
    TripController.postTimeRange
  )
  .patch(
    "/delete-time-range",
    auth(config.auth_level.admin),
    TripController.deleteTimeRange
  );

module.exports = router;

const auth = require("../../middleware/auth");
const express = require("express");
const DashboardController = require("./dashboard.controller");
const config = require("../../../config");
const { uploadFile } = require("../../middleware/fileUploader");

const router = express.Router();

router

  // overview ========================
  .get(
    "/total-overview",
    auth(config.auth_level.admin),
    DashboardController.totalOverview
  )
  .get("/revenue", auth(config.auth_level.admin), DashboardController.revenue)
  .get("/growth", auth(config.auth_level.admin), DashboardController.growth)

  // driver management ==================
  .post(
    "/post-driver",
    auth(config.auth_level.admin),
    uploadFile(),
    DashboardController.postDriver
  )
  .get(
    "/get-driver",
    auth(config.auth_level.admin),
    DashboardController.getDriver
  )
  .get(
    "/get-all-drivers-or-users",
    auth(config.auth_level.admin),
    DashboardController.getAllDriversOrUsers
  )
  .patch(
    "/edit-driver",
    auth(config.auth_level.admin),
    uploadFile(),
    DashboardController.editDriver
  )
  .get(
    "/get-user-trip-stats",
    auth(config.auth_level.admin),
    DashboardController.getUserTripStats
  );

module.exports = router;

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

  // driver management
  .post(
    "/post-driver",
    auth(config.auth_level.admin),
    uploadFile(),
    DashboardController.postDriver
  )
  .patch(
    "/edit-driver",
    auth(config.auth_level.admin),
    uploadFile(),
    DashboardController.editDriver
  );

module.exports = router;

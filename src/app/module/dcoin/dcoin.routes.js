const express = require("express");
const auth = require("../../middleware/auth");
const config = require("../../../config");
const DCoinController = require("./dCoin.controller");

const router = express.Router();

router
  .get("/get-dCoin", auth(config.auth_level.user), DCoinController.getDCoin)
  .patch(
    "/update-dCoin",
    auth(config.auth_level.admin),
    DCoinController.updateDCoin
  );

module.exports = router;

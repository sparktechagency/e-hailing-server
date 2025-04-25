const express = require("express");
const auth = require("../../middleware/auth");
const config = require("../../../config");
const DCoinController = require("./dcoin.controller");

const router = express.Router();

router
  .post(
    "/post-dCoin-packet",
    auth(config.auth_level.admin),
    DCoinController.postDCoin
  )
  .get("/get-dCoin", auth(config.auth_level.user), DCoinController.getDCoin)
  .get(
    "/get-all-dCoins",
    auth(config.auth_level.user),
    DCoinController.getAllDCoins
  )
  .patch(
    "/update-dCoin",
    auth(config.auth_level.admin),
    DCoinController.updateDCoin
  )
  .delete(
    "/delete-dCoin",
    auth(config.auth_level.admin),
    DCoinController.deleteDCoin
  );

module.exports = router;

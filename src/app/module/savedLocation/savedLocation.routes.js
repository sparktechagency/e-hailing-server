const express = require("express");
const auth = require("../../middleware/auth");
const config = require("../../../config");
const SavedLocationController = require("./savedLocation.controller");

const router = express.Router();

router
  .post(
    "/post-saved-location",
    auth(config.auth_level.user),
    SavedLocationController.postSavedLocation
  )
  .get(
    "/get-saved-location",
    auth(config.auth_level.user),
    SavedLocationController.getSavedLocation
  )
  .get(
    "/get-my-saved-location",
    auth(config.auth_level.user),
    SavedLocationController.getMySavedLocations
  )
  .delete(
    "/delete-saved-location",
    auth(config.auth_level.user),
    SavedLocationController.deleteSavedLocation
  );

module.exports = router;

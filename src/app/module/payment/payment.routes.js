const express = require("express");
const auth = require("../../middleware/auth");
const config = require("../../../config");
const PaymentController = require("./payment.controller");

const router = express.Router();

router

  .get("/initiate", 
    // auth(config.auth_level.user),
    PaymentController.initiatePayment
  )
  .get(
    "/get-payment",
    auth(config.auth_level.user),
    PaymentController.getPayment
  )
  .get(
    "/get-all-payments",
    auth(config.auth_level.user),
    PaymentController.getAllPayments
  )
  .get(
    "/get-driver-earning-report",
    auth(config.auth_level.user),
    PaymentController.getDriverEarningReport
  )
  .get(
    "/get-driver-earning-report",
    auth(config.auth_level.driver),
    PaymentController.getDriverEarningReport
  );
  

module.exports = router;

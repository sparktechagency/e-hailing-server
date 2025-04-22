const express = require("express");
const auth = require("../../middleware/auth");
const config = require("../../../config");
const PaymentController = require("./payment.controller");

const router = express.Router();

router
  .get(
    "/get-payment",
    auth(config.auth_level.user),
    PaymentController.getPayment
  )
  .get(
    "/get-all-payments",
    auth(config.auth_level.user),
    PaymentController.getAllPayments
  );

module.exports = router;

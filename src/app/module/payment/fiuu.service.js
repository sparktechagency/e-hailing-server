const { default: status } = require("http-status");
const Payment = require("./Payment");
const QueryBuilder = require("../../../builder/queryBuilder");
const ApiError = require("../../../error/ApiError");
const validateFields = require("../../../util/validateFields");
const { default: mongoose } = require("mongoose");
const {
  EnumPaymentStatus,
  EnumPaymentFor,
  EnumPaymentType,
} = require("../../../util/enum");

const getAllPayments = async (userData, query) => {};

const PaymentService = {
  // FIUU_API_URL=https://www.onlinepayment.com.my/MOLPay/pay/ # Check Fiuu docs for the correct endpoint
  // FIUU_RETURN_URL=yourApp://payment/success # Your app's custom URL scheme
  // FIUU_CALLBACK_URL=https://yourdomain.com/api/payment/fiuu-callback
  // FIUU_NOTIFICATION_URL=https://yourdomain.com/api/payment/fiuu-notification # If applicable
};

module.exports = PaymentService;

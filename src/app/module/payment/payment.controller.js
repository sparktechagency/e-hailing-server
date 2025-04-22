const PaymentService = require("./payment.service");
const sendResponse = require("../../../util/sendResponse");
const catchAsync = require("../../../util/catchAsync");

const getPayment = catchAsync(async (req, res) => {
  const result = await PaymentService.getPayment(req.user, req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment retrieved",
    data: result,
  });
});

const getAllPayments = catchAsync(async (req, res) => {
  const result = await PaymentService.getAllPayments(req.user, req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payments retrieved",
    data: result,
  });
});

const PaymentController = {
  getPayment,
  getAllPayments,
};

module.exports = PaymentController;

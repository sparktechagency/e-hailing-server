const { default: status } = require("http-status");
const Payment = require("./Payment");
const QueryBuilder = require("../../../builder/queryBuilder");
const ApiError = require("../../../error/ApiError");
const validateFields = require("../../../util/validateFields");

const getPayment = async (userData, query) => {
  validateFields(query, ["paymentId"]);

  const payment = await Payment.findOne({
    _id: query.paymentId,
  })
    .populate([{ path: "user" }, { path: "driver" }, { path: "trip" }])
    .lean();

  if (!payment) throw new ApiError(status.NOT_FOUND, "Payment not found");

  return payment;
};

const getAllPayments = async (userData, query) => {
  const paymentQuery = new QueryBuilder(Payment.find({}).lean(), query)
    .search([])
    .filter()
    .sort()
    .paginate()
    .fields();

  const [payments, meta] = await Promise.all([
    paymentQuery.modelQuery,
    paymentQuery.countTotal(),
  ]);

  return {
    meta,
    payments,
  };
};

const PaymentService = {
  getPayment,
  getAllPayments,
};

module.exports = PaymentService;

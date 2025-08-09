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

const createPayment = async ()=>{
  
}

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

const getDriverEarningReport = async (userData, query) => {
  const { year: strYear, type = EnumPaymentType.CASH } = query;

  validateFields(query, ["year"]);

  const year = Number(strYear);
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year + 1, 0, 1);

  const driverId = mongoose.Types.ObjectId.createFromHexString(userData.userId);
  const revenueField =
    type === EnumPaymentType.COIN ? "$amountInCoins" : "$amountInCash";

  const [result] = await Payment.aggregate([
    {
      $match: {
        paymentFor: EnumPaymentFor.TRIP,
        status: EnumPaymentStatus.SUCCEEDED,
        driver: driverId,
      },
    },
    {
      $facet: {
        // All years this driver earned
        distinctYears: [
          {
            $group: {
              _id: { $year: "$createdAt" },
            },
          },
          {
            $sort: { _id: 1 },
          },
          {
            $project: {
              year: "$_id",
              _id: 0,
            },
          },
        ],

        // Monthly revenue based on dynamic type (cash or coin)
        monthlyRevenue: [
          {
            $match: {
              createdAt: {
                $gte: startDate,
                $lt: endDate,
              },
            },
          },
          {
            $project: {
              month: { $month: "$createdAt" },
              revenue: revenueField, // 👈 dynamic field
            },
          },
          {
            $group: {
              _id: "$month",
              totalRevenue: { $sum: "$revenue" },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ],

        // Revenue split by cash/coin
        tripRevenueBreakdown: [
          {
            $group: {
              _id: "$paymentType", // cash / coin
              total: {
                $sum: {
                  $add: [
                    { $ifNull: ["$amountInCash", 0] },
                    { $ifNull: ["$amountInCoins", 0] },
                  ],
                },
              },
            },
          },
          {
            $sort: { total: 1 },
          },
        ],
      },
    },
  ]);

  const {
    distinctYears = [],
    monthlyRevenue = [],
    tripRevenueBreakdown = [],
  } = result || {};

  const totalYears = distinctYears.map((item) => item.year);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const monthlyRevenueObj = monthNames.reduce((acc, month) => {
    acc[month] = 0;
    return acc;
  }, {});

  monthlyRevenue.forEach((r) => {
    const monthName = monthNames[r._id - 1];
    monthlyRevenueObj[monthName] = r.totalRevenue;
  });

  const tripPaymentAnalysis = {};
  tripRevenueBreakdown.forEach((item) => {
    tripPaymentAnalysis[item._id] = item.total;
  });

  return {
    tripPaymentAnalysis,
    total_years: totalYears,
    monthlyRevenue: monthlyRevenueObj,
  };
};

const PaymentService = {
  getPayment,
  getAllPayments,
  getDriverEarningReport,
};

module.exports = PaymentService;

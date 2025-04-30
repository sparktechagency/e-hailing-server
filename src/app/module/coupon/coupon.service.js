const { default: status } = require("http-status");
const Coupon = require("./Coupon");
const QueryBuilder = require("../../../builder/queryBuilder");
const ApiError = require("../../../error/ApiError");
const validateFields = require("../../../util/validateFields");
const dateTimeValidator = require("../../../util/dateTimeValidator");

const postCoupon = async (userData, payload) => {
  validateFields(payload, [
    "coupon",
    "percentage",
    "startDate",
    "startTime",
    "endDate",
    "endTime",
  ]);

  const { coupon, percentage, startDate, startTime, endDate, endTime } =
    payload;

  dateTimeValidator([startDate, endDate], [startTime, endTime]);

  const newStartDateTime = new Date(`${startDate} ${startTime}`);
  const newEndDateTime = new Date(`${endDate} ${endTime}`);

  const couponData = {
    coupon,
    percentage,
    startDateTime: newStartDateTime,
    endDateTime: newEndDateTime,
  };

  const newCoupon = await Coupon.create(couponData);

  return newCoupon;
};

const getCoupon = async (userData, query) => {
  validateFields(query, ["couponId"]);

  const coupon = await Coupon.findOne({ _id: query.couponId }).lean();

  if (!coupon) throw new ApiError(status.NOT_FOUND, "Coupon not found");

  return coupon;
};

const getAllCoupons = async (userData, query) => {
  const couponQuery = new QueryBuilder(Coupon.find({}).lean(), query)
    .search([])
    .filter()
    .sort()
    .paginate()
    .fields();

  const [coupons, meta] = await Promise.all([
    couponQuery.modelQuery,
    couponQuery.countTotal(),
  ]);

  return {
    meta,
    coupons,
  };
};

const getSearchCoupon = async (userData, payload) => {
  validateFields(payload, ["coupon"]);
  const { coupon } = payload;

  const existingCoupon = await Coupon.findOne({ coupon });

  if (!existingCoupon)
    throw new ApiError(httpStatus.NOT_FOUND, "No coupons found");

  return existingCoupon;
};

const deleteCoupon = async (userData, payload) => {
  validateFields(payload, ["couponId"]);

  const coupon = await Coupon.deleteOne({ _id: payload.couponId });

  if (!coupon.deletedCount)
    throw new ApiError(status.NOT_FOUND, "Coupon not found");

  return coupon;
};

const CouponService = {
  postCoupon,
  getCoupon,
  getAllCoupons,
  getSearchCoupon,
  deleteCoupon,
};

module.exports = CouponService;

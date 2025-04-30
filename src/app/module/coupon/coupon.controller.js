const CouponService = require("./coupon.service");
const sendResponse = require("../../../util/sendResponse");
const catchAsync = require("../../../util/catchAsync");

const postCoupon = catchAsync(async (req, res) => {
  const result = await CouponService.postCoupon(req.user, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Coupon created",
    data: result,
  });
});

const getCoupon = catchAsync(async (req, res) => {
  const result = await CouponService.getCoupon(req.user, req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Coupon retrieved",
    data: result,
  });
});

const getAllCoupons = catchAsync(async (req, res) => {
  const result = await CouponService.getAllCoupons(req.user, req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Coupons retrieved",
    data: result,
  });
});

const getSearchCoupon = catchAsync(async (req, res) => {
  const result = await CouponService.getSearchCoupon(req.user, req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Coupons retrieved",
    data: result,
  });
});

const deleteCoupon = catchAsync(async (req, res) => {
  const result = await CouponService.deleteCoupon(req.user, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Coupon deleted",
    data: result,
  });
});

const CouponController = {
  postCoupon,
  getCoupon,
  getAllCoupons,
  getSearchCoupon,
  deleteCoupon,
};

module.exports = CouponController;

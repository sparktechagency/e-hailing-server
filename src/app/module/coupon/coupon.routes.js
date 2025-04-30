const express = require("express");
const auth = require("../../middleware/auth");
const config = require("../../../config");
const CouponController = require("./coupon.controller");

const router = express.Router();

router
  .post(
    "/post-coupon",
    auth(config.auth_level.user),
    CouponController.postCoupon
  )
  .get("/get-coupon", auth(config.auth_level.user), CouponController.getCoupon)
  .get(
    "/get-all-coupons",
    auth(config.auth_level.admin),
    CouponController.getAllCoupons
  )
  .get(
    "/search-coupon",
    auth(config.auth_level.user),
    CouponController.getSearchCoupon
  )
  .delete(
    "/delete-coupon",
    auth(config.auth_level.user),
    CouponController.deleteCoupon
  );

module.exports = router;

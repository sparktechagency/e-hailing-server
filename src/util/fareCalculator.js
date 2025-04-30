const Coupon = require("../app/module/coupon/Coupon");
const Fare = require("../app/module/trip/Fare");

const fareCalculator = async (duration, distance, couponName = null) => {
  const [coupon, fareData] = await Promise.all([
    couponName ? Coupon.findOne({ coupon: couponName }).lean() : null,
    Fare.findOne({}).lean(),
  ]);

  const baseFare = fareData.baseFare;
  const farePerKm = fareData.farePerKm;
  const farePerMin = fareData.farePerMin;
  const minFare = fareData.minFare;

  const distanceInKm = Math.ceil(Number(distance) / 1000);
  const durationInMin = Math.ceil(Number(duration));
  let finalFare = Math.ceil(
    baseFare + distanceInKm * farePerKm + durationInMin * farePerMin
  );

  if (finalFare < minFare) finalFare = minFare;

  if (coupon) finalFare = applyCoupon(finalFare, coupon);

  return finalFare;
};

const applyCoupon = (fare, coupon) => {
  const now = new Date();

  if (
    coupon.isExpired ||
    now < coupon.startDateTime ||
    now > coupon.endDateTime
  ) {
    throw new Error("Coupon is invalid or expired");
  }

  const discountedFare = Math.ceil(fare - (fare * coupon.percentage) / 100);
  return discountedFare < 0 ? 0 : discountedFare;
};

module.exports = fareCalculator;

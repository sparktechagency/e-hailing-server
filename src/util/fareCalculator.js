const Coupon = require("../app/module/coupon/Coupon");
const Fare = require("../app/module/trip/Fare");
const isPeakHour = require("./isPeakHour");

/**
 * Calculates the fare for a ride based on duration, distance, and optional coupon
 * @async
 * @param {number} duration - The duration of the ride in seconds
 * @param {number} distance - The distance of the ride in meters
 * @param {string} [couponName=null] - Optional coupon code to apply discount
 * @returns {Promise<number>} The calculated final fare amount
 *
 * @description
 * Calculates ride fare using:
 * - Base fare
 * - Per kilometer rate
 * - Per minute rate
 * - Minimum fare threshold
 * - Peak hour multiplier (2x during peak hours)
 * - Coupon discount if applicable
 *
 * The calculation first converts distance to kilometers and duration to minutes,
 * applies the base rates, ensures minimum fare, checks for peak hours,
 * and finally applies any valid coupon discount.
 */
const fareCalculator = async (duration, distance, couponName = null) => {
  const [coupon, fareData, peakHour] = await Promise.all([
    couponName ? Coupon.findOne({ coupon: couponName }).lean() : null,
    Fare.findOne({}).lean(),
    isPeakHour(),
  ]);

  const { baseFare, farePerKm, farePerMin, minFare } = fareData || {
    baseFare: 0,
    farePerKm: 0,
    farePerMin: 0,
    minFare: 0,
  };

  const distanceInKm = Math.ceil(Number(distance) / 1000);
  const durationInMin = Math.ceil(Number(duration));
  let finalFare = Math.ceil(
    baseFare + distanceInKm * farePerKm + durationInMin * farePerMin
  );

  if (finalFare < minFare) finalFare = minFare;

  if (peakHour) finalFare = finalFare * 2;

  if (coupon) finalFare = applyCoupon(finalFare, coupon);

  return finalFare;
};

const applyCoupon = (fare, coupon) => {
  const now = new Date();

  if (coupon.isExpired || now > coupon.endDateTime) {
    throw new Error("Coupon is invalid or expired");
  }

  const discountedFare = Math.ceil(fare - (fare * coupon.percentage) / 100);
  const finalDiscountedFare = discountedFare < 0 ? 0 : discountedFare;
  return finalDiscountedFare;
};

module.exports = fareCalculator;

const Fare = require("../app/module/trip/Fare");

const fareCalculator = async (duration, distance) => {
  const fareData = await Fare.findOne({}).lean();

  const baseFare = fareData.baseFare;
  const farePerKm = fareData.baseFare;
  const farePerMin = fareData.baseFare;
  const minFare = fareData.baseFare;

  const totalFare =
    baseFare +
    (Math.ceil(Number(distance)) / 1000) * farePerKm +
    Math.ceil(Number(duration)) * farePerMin;

  const decimalPart = totalFare % 1;
  let finalFare;

  if (decimalPart > 0 && decimalPart <= 0.49) {
    finalFare = Math.floor(totalFare) + 0.5;
  } else if (decimalPart >= 0.51) {
    finalFare = Math.floor(totalFare) + 1;
  } else {
    finalFare = totalFare;
  }

  return finalFare < minFare ? minFare : finalFare;
};

module.exports = fareCalculator;

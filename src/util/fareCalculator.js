const fareCalculator = (duration, distance) => {
  const baseFare = 3;
  const farePerKm = 0.34;
  const farePerMin = 0.58;
  const minFare = 6.5;

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

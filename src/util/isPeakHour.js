const moment = require("moment");
const PeakHour = require("../app/module/trip/PeakHour");

const isPeakHour = async () => {
  const peak = await PeakHour.findOne();
  if (!peak || !peak.isActive) return false;

  const now = moment();

  for (let { start, end } of peak.timeRanges) {
    const startTime = moment(start, "hh:mm a");
    const endTime = moment(end, "hh:mm a");

    if (now.isBetween(startTime, endTime)) return true;
  }

  return false;
};

module.exports = isPeakHour;

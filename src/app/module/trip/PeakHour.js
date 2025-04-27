const { model, Schema } = require("mongoose");

const timeRangeSchema = new Schema({
  start: {
    type: String,
  }, // "HH:MM am/pm"
  end: {
    type: String,
  }, // "HH:MM am/pm"
});

const peakHourSchema = new Schema(
  {
    timeRanges: [timeRangeSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const PeakHour = model("PeakHour", peakHourSchema);
module.exports = PeakHour;

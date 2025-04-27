const { model, Schema } = require("mongoose");

const fareSchema = new Schema(
  {
    baseFare: {
      type: Number,
    },
    farePerKm: {
      type: Number,
    },
    farePerMin: {
      type: Number,
    },
    minFare: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const Fare = model("Fare", fareSchema);
module.exports = Fare;

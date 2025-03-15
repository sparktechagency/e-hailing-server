const { Schema, model } = require("mongoose");

const dCoinSchema = new Schema(
  {
    MYR: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const DCoin = model("DCoin", dCoinSchema);

module.exports = DCoin;

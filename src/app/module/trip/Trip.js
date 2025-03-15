const { Schema, model } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const tripSchema = new Schema(
  {},
  {
    timestamps: true,
  }
);

const Trip = model("Trip", tripSchema);

module.exports = Trip;

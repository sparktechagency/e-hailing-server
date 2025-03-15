const { Schema, model } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const savedLocationSchema = new Schema(
  {},
  {
    timestamps: true,
  }
);

const SavedLocation = model("SavedLocation", savedLocationSchema);

module.exports = SavedLocation;

const { Schema, model } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const savedLocationSchema = new Schema(
  {
    user: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    locationName: {
      type: String,
      required: true,
    },
    locationAddress: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

const SavedLocation = model("SavedLocation", savedLocationSchema);

module.exports = SavedLocation;

const { Schema, model } = require("mongoose");
const { TripStatus } = require("../../../util/enum");
const ObjectId = Schema.Types.ObjectId;

const tripSchema = new Schema(
  {
    user: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    driver: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    car: {
      type: ObjectId,
      ref: "Car",
      required: true,
    },
    pickUpAddress: {
      type: String,
      required: true,
    },
    pickUpCoordinates: {
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
    dropOffAddress: {
      type: String,
      required: true,
    },
    dropOffCoordinates: {
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
    duration: {
      type: Number,
      required: true,
    },
    distance: {
      type: Number,
      required: true,
    },
    estimatedFare: {
      type: Number,
    },
    tollFee: {
      type: Number,
    },
    finalFare: {
      type: Number,
    },
    tripStartedAt: {
      type: Date,
    },
    tripCompletedAt: {
      type: Date,
    },
    cancellationReason: {
      type: [String],
    },
    status: {
      type: String,
      enum: {
        values: [
          TripStatus.REQUESTED,
          TripStatus.ACCEPTED,
          TripStatus.ON_THE_WAY,
          TripStatus.ARRIVED,
          TripStatus.PICKED_UP,
          TripStatus.STARTED,
          TripStatus.COMPLETED,
          TripStatus.CANCELLED,
        ],
        message: `Invalid trip status. Allowed values: ${Object.values(
          TripStatus
        ).join(", ")}`,
      },
      default: "requested",
    },
  },
  {
    timestamps: true,
  }
);

tripSchema.index({ pickUpCoordinates: "2dsphere" });
tripSchema.index({ dropOffCoordinates: "2dsphere" });

const Trip = model("Trip", tripSchema);

module.exports = Trip;

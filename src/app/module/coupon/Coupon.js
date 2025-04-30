const { Schema, model } = require("mongoose");

const couponSchema = new Schema(
  {
    coupon: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: [6, "Coupon code must be at least 6 characters long"],
    },
    percentage: {
      type: Number,
      required: true,
      min: [1, "Percentage must be at least 1%"],
      max: [100, "Percentage cannot exceed 100%"],
    },
    isExpired: {
      type: Boolean,
      default: false,
    },
    startDateTime: {
      type: Date,
      required: true,
    },
    endDateTime: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value > this.startDateTime;
        },
        message: "End date must be after the start date.",
      },
    },
  },
  {
    timestamps: true,
  }
);

const Coupon = model("Coupon", couponSchema);

module.exports = Coupon;

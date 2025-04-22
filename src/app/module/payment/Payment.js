const { Schema, model } = require("mongoose");
const {
  EnumPaymentStatus,
  EnumPaymentType,
  EnumPaymentFor,
} = require("../../../util/enum");
const ObjectId = Schema.Types.ObjectId;

const paymentSchema = new Schema(
  {
    user: {
      type: ObjectId,
      ref: "User",
    },
    driver: {
      type: ObjectId,
      ref: "User",
    },
    trip: {
      type: ObjectId,
      ref: "Trip",
    },
    amountForCoinPurchase: {
      type: Number,
    },
    amountInCoins: {
      type: Number,
    },
    amountInCash: {
      type: Number,
    },
    checkout_session_id: {
      type: String,
      unique: true,
      required: true,
    },
    payment_intent_id: {
      type: String,
    },
    paymentFor: {
      type: String,
      required: true,
      enum: {
        values: [EnumPaymentFor.COIN_PURCHASE, EnumPaymentFor.TRIP],
        message: `Invalid trip status. Allowed values: ${Object.values(
          EnumPaymentFor
        ).join(", ")}`,
      },
    },
    paymentType: {
      type: String,
      required: true,
      enum: {
        values: [EnumPaymentType.COIN, EnumPaymentType.CASH],
        message: `Invalid trip status. Allowed values: ${Object.values(
          EnumPaymentType
        ).join(", ")}`,
      },
    },
    status: {
      type: String,
      default: EnumPaymentStatus.UNPAID,
      enum: {
        values: [EnumPaymentStatus.UNPAID, EnumPaymentStatus.SUCCEEDED],
        message: `Invalid trip status. Allowed values: ${Object.values(
          EnumPaymentStatus
        ).join(", ")}`,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Payment = model("Payment", paymentSchema);

module.exports = Payment;

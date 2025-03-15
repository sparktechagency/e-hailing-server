const mongoose = require("mongoose");
const { UserAccountStatus } = require("../../../util/enum");

const { Schema, model, Types } = mongoose;

const ObjectId = Schema.Types.ObjectId;

const UserSchema = new Schema(
  {
    authId: {
      type: ObjectId,
      required: true,
      ref: "Auth",
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["USER", "DRIVER"],
      required: true,
    },
    profile_image: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    dateOfBirth: {
      type: String,
    },
    address: {
      type: String,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },

    // driver specific fields
    idOrPassportNo: {
      type: String,
    },
    drivingLicenseNo: {
      type: String,
    },
    licenseType: {
      type: String,
    },
    licenseExpiry: {
      type: String,
    },
    id_or_passport_image: {
      type: String,
    },
    psv_license_image: {
      type: String,
    },
    driving_license_image: {
      type: String,
    },
    assignedCar: {
      type: ObjectId,
      ref: "Car",
    },

    // user specific fields
    emergencyPhoneNumber: {
      type: String,
    },
    userAccountStatus: {
      type: String,
      enum: {
        values: Object.values(UserAccountStatus),
        message: `Invalid value. Allowed values: ${Object.values(
          UserAccountStatus
        ).join(", ")}`,
      },
      default: UserAccountStatus.UNVERIFIED,
    },
    coins: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const User = model("User", UserSchema);

module.exports = User;

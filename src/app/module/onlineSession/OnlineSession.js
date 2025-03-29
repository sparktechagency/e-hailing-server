const { Schema, model } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const sessionSchema = new Schema(
  {
    driver: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    start: {
      type: Date,
      default: new Date(),
    },
    end: {
      type: Date,
    },
    duration: {
      type: Number, // in milliseconds
    },
  },
  {
    timestamps: true,
  }
);

const OnlineSession = model("OnlineSession", sessionSchema);

module.exports = OnlineSession;

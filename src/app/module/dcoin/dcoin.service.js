const { default: status } = require("http-status");
const DCoin = require("./DCoin");
const ApiError = require("../../../error/ApiError");
const validateFields = require("../../../util/validateFields");

const getDCoin = async (userData, query) => {
  const dCoin = await DCoin.find({}).lean();

  if (!dCoin) throw new ApiError(status.NOT_FOUND, "D Coin not found");

  return dCoin;
};

const updateDCoin = async (userData, payload) => {
  validateFields(payload, ["MYR"]);

  const dCoin = await DCoin.findOne({}).lean();

  if (!dCoin) {
    const newDCoin = await DCoin.create(payload);
    return newDCoin;
  } else {
    const updatedDCoin = await DCoin.findOneAndUpdate({}, payload, {
      new: true,
      runValidators: true,
    });

    return updatedDCoin;
  }
};

const DCoinService = {
  getDCoin,
  updateDCoin,
};

module.exports = DCoinService;

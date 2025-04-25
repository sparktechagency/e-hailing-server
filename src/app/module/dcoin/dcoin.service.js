const { default: status } = require("http-status");
const DCoin = require("./DCoin");
const QueryBuilder = require("../../../builder/queryBuilder");
const ApiError = require("../../../error/ApiError");
const validateFields = require("../../../util/validateFields");

// add a new DCoin package
const postDCoin = async (userData, payload) => {
  validateFields(payload, ["coin", "MYR"]);

  const dCoin = await DCoin.create({
    coin: Number(payload.coin),
    MYR: Number(payload.MYR),
  });

  return dCoin;
};

const getDCoin = async (userData, query) => {
  validateFields(query, ["dCoinId"]);

  const dCoin = await DCoin.findOne({
    _id: query.dCoinId,
  }).lean();

  if (!dCoin)
    throw new ApiError(status.NOT_FOUND, "Dudu Coin package not found");

  return dCoin;
};

const getAllDCoins = async (userData, query) => {
  const dCoinQuery = new QueryBuilder(DCoin.find({}).lean(), query)
    .search([])
    .filter()
    .sort()
    .paginate()
    .fields();

  const [dCoins, meta] = await Promise.all([
    dCoinQuery.modelQuery,
    dCoinQuery.countTotal(),
  ]);

  return {
    meta,
    dCoins,
  };
};

const updateDCoin = async (userData, payload) => {
  validateFields(payload, ["dCoinId", "coin", "MYR"]);

  const dCoin = await DCoin.findOneAndUpdate(
    {
      _id: payload.dCoinId,
    },
    {
      coin: Number(payload.coin),
      MYR: Number(payload.MYR),
    },
    {
      new: true,
      runValidators: true,
    }
  ).lean();

  if (!dCoin)
    throw new ApiError(status.NOT_FOUND, "Dudu Coin package not found");

  return dCoin;
};

const deleteDCoin = async (userData, payload) => {
  validateFields(payload, ["dCoinId"]);

  const dCoin = await DCoin.deleteOne({
    _id: payload.dCoinId,
  });

  if (!dCoin.deletedCount)
    throw new ApiError(status.NOT_FOUND, "Dudu Coin not found");

  return dCoin;
};

const DCoinService = {
  postDCoin,
  getDCoin,
  getAllDCoins,
  updateDCoin,
  deleteDCoin,
};

module.exports = DCoinService;

const DCoinService = require("./dcoin.service");
const sendResponse = require("../../../util/sendResponse");
const catchAsync = require("../../../util/catchAsync");

const postDCoin = catchAsync(async (req, res) => {
  const result = await DCoinService.postDCoin(req.user, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Dudu Coin created",
    data: result,
  });
});

const getDCoin = catchAsync(async (req, res) => {
  const result = await DCoinService.getDCoin(req.user, req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Dudu Coin retrieved",
    data: result,
  });
});

const getAllDCoins = catchAsync(async (req, res) => {
  const result = await DCoinService.getAllDCoins(req.user, req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Dudu Coins retrieved",
    data: result,
  });
});

const updateDCoin = catchAsync(async (req, res) => {
  const result = await DCoinService.updateDCoin(req.user, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Dudu Coin updated",
    data: result,
  });
});

const deleteDCoin = catchAsync(async (req, res) => {
  const result = await DCoinService.deleteDCoin(req.user, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Dudu Coin deleted",
    data: result,
  });
});

const DCoinController = {
  postDCoin,
  getDCoin,
  getAllDCoins,
  updateDCoin,
  deleteDCoin,
};

module.exports = DCoinController;

const DCoinService = require("./dCoin.service");
const sendResponse = require("../../../util/sendResponse");
const catchAsync = require("../../../util/catchAsync");

const getDCoin = catchAsync(async (req, res) => {
  const result = await DCoinService.getDCoin(req.user, req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "D Coin retrieved",
    data: result,
  });
});

const updateDCoin = catchAsync(async (req, res) => {
  const result = await DCoinService.updateDCoin(req.user, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "One D Coin value updated",
    data: result,
  });
});

const DCoinController = {
  getDCoin,
  updateDCoin,
};

module.exports = DCoinController;

const NotificationService = require("./notification.service");
const sendResponse = require("../../../util/sendResponse");
const catchAsync = require("../../../util/catchAsync");


const sendNotification  = catchAsync(async (req,res)=>{

  const {token} = req.query

  const payload = req.body

  const data = await NotificationService.sendNotification(token, payload)
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notification sent",
    data,
  });

})

const getNotification = catchAsync(async (req, res) => {
  const result = await NotificationService.getNotification(req.user, req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notification retrieved",
    data: result,
  });
});

const getAllNotifications = catchAsync(async (req, res) => {
  const result = await NotificationService.getAllNotifications(
    req.user,
    req.query
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notifications retrieved",
    data: result,
  });
});

const updateAsReadUnread = catchAsync(async (req, res) => {
  const result = await NotificationService.updateAsReadUnread(
    req.user,
    req.body
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notification updated",
    data: result,
  });
});

const deleteNotification = catchAsync(async (req, res) => {
  const result = await NotificationService.deleteNotification(
    req.user,
    req.body
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notification deleted",
    data: result,
  });
});

const NotificationController = {
  getNotification,
  getAllNotifications,
  updateAsReadUnread,
  deleteNotification,
  sendNotification
};

module.exports = NotificationController;

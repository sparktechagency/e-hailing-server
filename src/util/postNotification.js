const AdminNotification = require("../app/module/notification/AdminNotification");
const Notification = require("../app/module/notification/Notification");
const NotificationService = require("../app/module/notification/notification.service");
const catchAsync = require("../util/catchAsync");

//add new parameter token for send push notification to the client usign firebase

const postNotification = catchAsync(async (title, message, toId = null) => {
  if (!title || !message)
    throw new Error("Missing required fields: title, or message");

  if (!toId) await AdminNotification.create({ title, message });
  else await Notification.create({ toId, title, message });

  try {
    //send notifaction to user using firebase
    if(toId){
      
      NotificationService.sendNotificationByUserId(toId, {title, message})
    }
  }catch(err){
    console.log("Firebase/postnotification: sending notification failed!")
    console.error(err)
  }
  
});

module.exports = postNotification;

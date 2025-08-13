const AdminNotification = require("../app/module/notification/AdminNotification");
const Notification = require("../app/module/notification/Notification");
const catchAsync = require("../util/catchAsync");
const firebaseClient = require('../app/module/notification/firebase')

//add new parameter token for send push notification to the client usign firebase

const postNotification = catchAsync(async (title, message, toId = null, token = null) => {
  if (!title || !message)
    throw new Error("Missing required fields: title, or message");

  if (!toId) await AdminNotification.create({ title, message });
  else await Notification.create({ toId, title, message });

  try {
    
    if(token){
      
      const notificationObject = {
        notification: {
          title,
          message,
        },
        token:token,
      };

      await firebaseClient.messaging().send(notificationObject)
    }
  } catch(err){
    console.error(err)
  }
  
});

module.exports = postNotification;

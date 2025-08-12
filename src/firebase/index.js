const admin = require('firebase-admin')
const keys = require('./keys.json')

try{
    admin.initializeApp({credential:keys})
    console.log("Firebase initialized successfully....")
}catch(err){
    console.error(err)
}


module.exports = firebaseClient
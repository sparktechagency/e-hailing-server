const admin = require('firebase-admin')
const config = require('../../../../config')


try{
    admin.initializeApp({credential:admin.credential.cert(config.firebaseKeys)})
    console.log("Firebase initialized successfully....")
}catch(err){
    console.error(err)
}


module.exports = admin
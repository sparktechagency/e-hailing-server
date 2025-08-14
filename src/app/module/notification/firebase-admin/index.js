const admin = require('firebase-admin')
const config = require('../../../../config')


try{
    admin.initializeApp({credential:admin.credential.cert(JSON.parse(config.firebaseKeys))})
    console.log("Firebase initialized successfully....")
}catch(err){
    console.error(err)
}


module.exports = admin
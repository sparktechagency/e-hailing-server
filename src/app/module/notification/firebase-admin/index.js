const admin = require('firebase-admin')
const keys = require('../../../../../Keys.json')


try{
    admin.initializeApp({credential:admin.credential.cert(keys)})
    console.log("Firebase initialized successfully....")
}catch(err){
    console.error(err)
}


module.exports = admin
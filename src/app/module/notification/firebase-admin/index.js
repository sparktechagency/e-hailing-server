const admin = require('firebase-admin')
const config = require('../../../../config')
const keys = require('./keys.json')


try{
    admin.initializeApp({credential:admin.credential.cert(keys)})
    console.log("Firebase initialized successfully....")
}catch(err){
    console.error(err)
}


module.exports = admin
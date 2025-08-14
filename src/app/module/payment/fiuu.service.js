const { default: status } = require("http-status");
const Payment = require("./Payment");
const QueryBuilder = require("../../../builder/queryBuilder");
const ApiError = require("../../../error/ApiError");
const validateFields = require("../../../util/validateFields");
const { default: mongoose } = require("mongoose");
const crypto  = require('crypto')
const {
  EnumPaymentStatus,
  EnumPaymentFor,
  EnumPaymentType,
} = require("../../../util/enum");
const generateHash = require("../../../util/md5");

const getAllPayments = async (userData, query) => {};


const FiuuService = {
  // FIUU_API_URL=https://www.onlinepayment.com.my/MOLPay/pay/ # Check Fiuu docs for the correct endpoint
  // FIUU_RETURN_URL=yourApp://payment/success # Your app's custom URL scheme
  // FIUU_CALLBACK_URL=https://yourdomain.com/api/payment/fiuu-callback
  // FIUU_NOTIFICATION_URL=https://yourdomain.com/api/payment/fiuu-notification # If applicable
  merchantId : 'duducar_Dev',
  Verify_Key:'dcbd7a3f0dbf412a0c2612337b28a9e9',
  secretKey:'441cb60ed3b0ee418fd41e13dd2b25df',

  generateVcode: generateVcode.bind(this),
  verifySKey : verifySKey.bind(this)
};


//function to generate unique vcode
//send vcode to payment request endpoint

function generateVcode(amount, orderId) {
  const raw = `${amount}${this.merchantId}${orderId}${this.Verify_Key}`;

  return generateHash(raw)
}


//veerify key return from payment service to authenticate the transaction

function verifySKey(data) {
  const preSkey = generateHash(`${data.tranID}${data.orderid}${data.status}${data.domain}${data.amount}${data.currency}`)
  const skey = generateHash(`${data.paydate}${data.domain}${preSkey}${data.appcode}${this.secretKey}`)

  return skey === data.skey;
}


module.exports = FiuuService;


const crypto = require('crypto')

const generateHash = (data)=>{
    const hash = crypto.createHash("md5").update(data).digest('hex')

    return hash
}

module.exports = generateHash
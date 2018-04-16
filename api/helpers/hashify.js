'use_strict'

// Creates an md5 hash string from a plain text string.
function hash(data) {
var crypto = require('crypto');
var hashed = crypto.createHash('md5').update(data).digest("hex");

return hashed;

}


module.exports = hash;

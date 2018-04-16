'use strict';
const logger = require('winston');
const fs = require('fs');
const env = process.env.NODE_ENV || 'development';
const logDir = 'log';
// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
const tsFormat = () => (new Date()).toString();
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
  timestamp: tsFormat,
  colorize: true,
  level: env === 'development' ? 'debug' : 'error'
})
logger.add(logger.transports.File, {
  filename: `${logDir}/application.log`,
  timestamp: tsFormat,
  level: env === 'development' ? 'debug' : 'info'
})
module.exports = logger

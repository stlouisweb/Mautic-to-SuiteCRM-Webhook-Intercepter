'use strict';

var rootCas = require('ssl-root-cas/latest').create();
rootCas.addFile(__dirname + '/ssl/myCA.pem')
  .addFile(__dirname + '/ssl/crm.oci.lan.crt');
require('https').globalAgent.options.ca = rootCas;

const logger = require('./logger');
const SwaggerExpress = require('swagger-express-mw');
const SwaggerUi = require('swagger-tools/middleware/swagger-ui');
const app = require('express')();
module.exports = app; // for testing

var config = {
  appRoot: __dirname // required config
};

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  app.use(SwaggerUi(swaggerExpress.runner.swagger));
  swaggerExpress.register(app);

  var port = process.env.PORT || 10010;
  app.listen(port);

  if (swaggerExpress.runner.swagger.paths['/hello']) {
    console.log('try this:\ncurl http://127.0.0.1:' + port + '/hello?name=Scott');
  }
});

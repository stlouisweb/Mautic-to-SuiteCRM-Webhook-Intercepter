'use strict';
/*
 'use strict' is not required but helpful for turning syntactical errors into true errors in the program flow
 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
*/

/*
 Modules make it possible to import JavaScript files into your application.  Modules are imported
 using 'require' statements that give you a reference to the module.

  It is a good idea to list the modules that your application depends on in the package.json in the project root
 */
const logger = require('winston');
const SuiteCrmClient = require('../helpers/suitecrm');
const util = require('util');
const crm = new SuiteCrmClient('https://crm.oci.lan', 'User', 'bitnami');
/*
 Once you 'require' a module you can reference the things that it exports.  These are defined in module.exports.

 For a controller in a127 (which this is) you should export the functions referenced in your Swagger document by name.

 Either:
  - The HTTP Verb of the corresponding operation (get, put, post, delete, etc)
  - Or the operationId associated with the operation in your Swagger document

  In the starter/skeleton project the 'get' operation on the '/hello' path has an operationId named 'hello'.  Here,
  we specify that in the exports of this module that 'hello' maps to the function named 'hello'
 */
module.exports = {
  getLeads: getLeads
};

/*
  Functions in a127 controllers used for operations should take two parameters:

  Param 1: a handle to the request object
  Param 2: a handle to the response object
 */
function getLeads(req, res) {
  const params = req.swagger.params;
  const {max_results: {value: maxResults = 0},
    offset: {value: offset = 0},
    order_by: {value: orderBy = 'date_entered'},
    order: {value: order = 'DESC'}
  } = params;

  crm.fetchLeads(maxResults, offset, orderBy, order)
  .then(leads => {
    res.json({leads: leads});
  })
  .catch(error => {
    if (error === '404') {
      res.status('404').json({message: '404 - No Lead found.'});
    } else {
      logger.error(error);
      res.json(error);
    }
  });
}

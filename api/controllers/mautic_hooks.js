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
const MauticClient = require('../helpers/mautic');
const SuiteCrmClient = require('../helpers/suitecrm');
const util = require('util');

const crm = new SuiteCrmClient(process.env.SUITECRM_URL, process.env.SUITECRM_USERNAME, process.env.SUITECRM_PASSWORD);
const mautic = new MauticClient(process.env.MAUTIC_URL, process.env.MAUTIC_USERNAME, process.env.MAUTIC_PASSWORD);
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
  handlePointsChange: handlePointsChange
};

/*
  Functions in a127 controllers used for operations should take two parameters:

  Param 1: a handle to the request object
  Param 2: a handle to the response object
 */
function handlePointsChange(req, res) {
  const reqBody = Object.assign({}, req.swagger.params.body.value);
  const mauticData = Object.assign({}, reqBody['mautic.lead_points_change'][0]);
  const mauticFields = mauticData.lead.fields.core;

  // check for email and/or phone - true => continue
  if (mauticFields.email.value == '' && mauticFields.mobile.value == '' && mauticFields.phone.value == '') {
    logger.info({'message': 'Invalid update - no contact info'})
    res.status('422').json({'message': 'Unprocessable Entity - no contact info'})
    return
  }

  // check if new_points > 50
  if (mauticData.points.new_points <= 50) {
    logger.info('Points too low, aborting update.');
    res.json({'message': 'Points to low, aborting update.'})
    return
  }

  if (mauticFields.email.value != '') {
    crm.findByEmail(mauticFields.email.value).then(leadData => {
      const leadId = leadData.entry_list[0] ? leadData.entry_list[0].id : false;

      if (leadId) {
        let lead = makeLeadObject(mauticFields, leadData.entry_list[0]).then(response => {
          logger.info(`UPDATED CRM LEAD: ${response.id}`)
          if (process.env.ARCHIVE_JUNK_LEADS == 'y') {
            archiveEmptyLeads();
          }
          res.json({"message": `UPDATED CRM LEAD: ${response.id}`});
          return
        });
      } else {
        let lead = makeLeadObject(mauticFields).then(response => {
          logger.info(`UPDATED CRM LEAD: ${response.id}`)
          if (process.env.ARCHIVE_JUNK_LEADS == 'y') {
            archiveEmptyLeads();
          }
          res.json({"message": `UPDATED CRM LEAD: ${response.id}`});
          return
        });
      }

    });
  } else if (mauticFields.mobile.value != '') {
    crm.findByPhone()
  } else if (mauticFields.phone.value != '') {
    crm.findByPhone()
  } else {
    makeLeadObject(mauticFields).then(response => {
      logger.info(`Created CRM Lead: ${response.id}`);
      archiveEmptyLeads();
      res.json(`Created CRM Lead: ${response.id}`);
      return
    })
  }


  // check for existing CRM Lead

  // process update

}

async function makeLeadObject(mauticLead, crmLead) {
    let lead = {}
    logger.info(crmLead)
    crmLead && crmLead.id ? (lead.id = {name: 'id', value: crmLead.id}) : undefined;
    crmLead && crmLead.status != 'Dead' ? (lead.status = {name: 'status', value: 'New'}) : undefined;
    mauticLead.firstname.value ? (lead.first_name = {name: 'first_name', value: mauticLead.firstname.value}) : undefined;
    mauticLead.lastname.value ? (lead.last_name = {name: 'last_name', value: mauticLead.lastname.value}) : undefined;
    mauticLead.email.value ? (lead.email1 = {name: 'email1', value: mauticLead.email.value}) : undefined;
    mauticLead.title.value ? (lead.salutation = {name: 'salutation', value: mauticLead.title.value}) : undefined;
    mauticLead.mobile.value ? (lead.phone_mobile = {name: 'phone_mobile', value: mauticLead.mobile.value}) : undefined;
    mauticLead.company.value ? (lead.account_name = {name: 'account_name', value: mauticLead.company.value}) : undefined;
    mauticLead.position.value ? (lead.title = {name: 'title', value: mauticLead.position.value}) : undefined;
    mauticLead.phone.value ? (lead.phone_work = {name: 'phone_work', value: mauticLead.phone.value}) : undefined;
    mauticLead.company.value ? (lead.account_name = {name: 'account_name', value: mauticLead.company.value}) : undefined;
    mauticLead.address1.value ? (lead.primary_address_street = {name: 'primary_address_street', value: mauticLead.address1.value}) : undefined;
    mauticLead.address2.value ? (lead.primary_address_street_2 = {name: 'primary_address_street_2', value: mauticLead.address2.value}) : undefined;
    mauticLead.city.value ? (lead.primary_address_city = {name: 'primary_address_city', value: mauticLead.city.value}) : undefined;
    mauticLead.state.value ? (lead.primary_address_state = {name: 'primary_address_state', value: mauticLead.state.value}) : undefined;
    mauticLead.country.value ? (lead.primary_address_country = {name: 'primary_address_country', value: mauticLead.country.value}) : undefined;
    mauticLead.zipcode.value ? (lead.primary_address_postalcode = {name: 'primary_address_postalcode', value: mauticLead.zipcode.value}) : undefined;
    logger.info('')
    logger.info(lead)
    logger.info('')
    let response = crm.postLead(lead).then(leadResponse => {
      return leadResponse
    })
    .catch(error => {error: error});
    return response
}

async function archiveEmptyLeads() {
  let response = crm.fetchBlanks().then(blanks => {
    logger.info('id', blanks.entry_list[0].id)
    let archivedArray = blanks.entry_list.map(entry => {
      logger.info('id', entry.id)
      let crmResponse = crm.deleteLead(entry.id).then(res => {
        return res
      })
      return crmResponse
    });
    logger.info(`ARCHIVED ${archivedArray.length} EMPTY CRM LEADS`);
    return archivedArray
  });
  return response
}

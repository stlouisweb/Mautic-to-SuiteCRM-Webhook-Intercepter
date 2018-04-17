'use_strict'

const _ = require('lodash');
const axios = require("axios");
const hashify = require('./hashify.js');
const logger = require('winston');

const apiRequest = async (apiUrl, method, rest_data) => {
  try {
    const apiPath = `${apiUrl}?method=${method}&input_type=JSON&response_type=JSON&rest_data=${JSON.stringify(rest_data)}`
    const response = await axios.post(apiPath);
    return response.data;

  } catch (error) {
    throw error;
  }
}

class SuitecrmClient {
  constructor(apiDomain, username, password) {
    this.apiUrl = `${apiDomain}/service/v4_1/rest.php`;
    this.username = username;
    this.password = password;
  }

  async getSession() {
    try {
      const rest_data =
        { userAuth:
          { user_name: this.username,
            password: hashify(this.password)
          },
          applicationName: "myClient",
          name_value_list: {}
        }
      const session = await apiRequest(this.apiUrl, 'login', rest_data);
      return session;
    } catch(error) {
      logger.error(error);
      throw(error);
    }
  }

  async deleteLead (leadId) {
    try {
      const session = await this.getSession();
      const rest_data = {
        session: session.id,
        module_name: 'Leads',
        name_value_list: [
          {'name': 'id', 'value': leadId},
          {'name': 'deleted', 'value': '1'}
        ]
      }
      const crmResponse = await apiRequest(this.apiUrl, 'set_entry', rest_data);
      return crmResponse
    } catch(error) {
      logger.error(error);
      throw(error);
    }
  }

  async fetchLead (leadId) {
    try {
      const session = await this.getSession();
      const rest_data =
      {
        session: session.id,
        module_name: 'Leads',
        id: leadId,
        select_fields: []
      }
      const crmResponse = await apiRequest(this.apiUrl, 'get_entry', rest_data);
      return crmResponse
    } catch(error) {
      logger.error(error);
      throw(error);
    }
  }

  async fetchLeads (maxResults, offset, orderBy, order) {
    try {
      const session = await this.getSession();
      const rest_data = {
        session: session.id,
        module_name: 'Leads'
      }
      const crmResponse = await apiRequest(this.apiUrl, 'get_entry_list', rest_data);
      let sortedData = _.sortBy(crmResponse.entry_list,
        ['name_value_list.date_entered.value']
        || ['name_value_list.' + orderBy + '.value']);
      if (order == 'DESC') {
        sortedData = sortedData.reverse()
      }
      if (offset) {
        sortedData = sortedData.slice(offset)
      }
      if (maxResults) {
        sortedData = sortedData.slice(0, maxResults)
      }
      return sortedData
    } catch(error) {
      logger.error(error);
      throw(error);
    }
  }

  async findByEmail(email) {
    try {
      const session = await this.getSession();
      const rest_data =
      {
        session: session.id,
        module_name: 'Leads',
        query: "leads.id IN (SELECT bean_id FROM email_addr_bean_rel eabr JOIN "
        + "email_addresses ea ON (eabr.email_address_id = ea.id) WHERE "
        + "bean_module = 'Leads' AND ea.email_address LIKE '" + email + "' AND "
        + "eabr.deleted=0)"
      }
      const crmResonse = await apiRequest(this.apiUrl, 'get_entry_list', rest_data);
      return crmResonse
    } catch(error) {
      logger.error(error);
      throw(error);
    }
  }

  async postLead (leadData) {
    try {
      const session = await this.getSession();
      const rest_data =
      {
        session: session.id,
        module_name: 'Leads',
        name_value_list: leadData
      }
      const crmResponse = await apiRequest(this.apiUrl, 'set_entry', rest_data);
      return crmResponse
    } catch(error) {
      logger.error(error);
      throw(error);
    }
  }
}

module.exports = SuitecrmClient

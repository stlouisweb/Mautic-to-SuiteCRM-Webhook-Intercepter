'use_strict'

const axios = require("axios");
const logger = require('winston');

class MauticClient {
  constructor(apiDomain, username, password) {
    this.apiUrl = `${apiDomain}/api`;
    this.username = username;
    this.password = password;
  }

  async fetchPointTriggers() {
    try {
      const response = await axios.get(`${this.apiUrl}/points/triggers`, {
        auth: {
          username: this.username,
          password: this.password
        }
      });
      return response.data;
    } catch(error) {
      logger.error(error)
      throw error;
    }
  }
}

module.exports = MauticClient

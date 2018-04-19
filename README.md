# Mautic-to-SuiteCRM Webhook Intercepter

This project is designed to provide a NodeJS web server for responding to Mautic webhook events and aims to provide RESTful JS clients to the Mautic and SuiteCRM APIs to advance Javascript development with these tools.
was started to work-around a limitation in Mautic's SugarCRM integration plugin when using SuiteCRM.

---

## Getting started

### Prerequisites

Before using this project you will need running instances of Mautic and SuiteCRM that are network accessible. You will then need to configure Mautic to integrate with SuiteCRM and the Intercepter.

1. Install the SuiteCRM plugin:
  - Create an oAuth key in SuiteCRM:
  <img src="./docs/create_oauth_key.png" width="700">

  - Authenticate Mautic SugarCRM plugin and configure Contact Mapping:
  <img src="./docs/mautic_sugarCRM_plugin.png" width="700">
  This will handle the initial push to crm based on the lowest value point trigger configured in Mautic.

2. Set up Mautic point trigger:
  - <img src="./docs/point_trigger.png" width="700">

### Configuration

The next step is to launch the Intercepter server and configure the webhook in Mautic.

1. Clone the project:
  - `git clone url`
2. Configure settings:
  - `cd path && ./setup.sh`
3. Start the server:
  - `npm install`
  - `npm start`
4. Test Swagger endpoints:

  - [http://server-address:10010/docs/#!](http://server-address:10010/docs/#!)
    <img src="./docs/swagger_ui.png" width="700">


### Logs

## Docker Compose

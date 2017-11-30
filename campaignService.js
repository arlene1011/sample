import grpc from 'grpc';
import * as constants from './common/constants';
import bunyan from 'bunyan';
import PropertyProvider from '../properties/propertyProvider';

const LOGGER = bunyan.createLogger({name:'CampaignService'});

module.exports = class CampaignService {
  constructor() {
    LOGGER.info('CampaignService instantiated');

    var propertyProvider = new PropertyProvider();
    var proto = __dirname + propertyProvider.getValue('campaign.proto.location',
                  '/static/proto/campaignform/campaign-form-management.proto');
    var campaignForm = grpc.load(proto).com.actions.protobuf.campaignform;
    this.client = new campaignForm.CampaignService(
                    propertyProvider.getValue('campaign.microservice.endpoint', 'localhost:50053'),
                    grpc.credentials.createInsecure());

  }

  getCampaignByOpaqueString(opaqueStr, impressionString, callback) {
    var request = this.buildCampaignRequest(opaqueStr, impressionString);
    var that = this;
    this.client.getCampaignByOpaqueString(request, function(error, response) {
      that.callbackFnc(error, response, callback);
    });

  }

  getCampaignByName(campaignName, impressionString, callback) {
    var request = this.buildCampaignRequest(campaignName, impressionString);

    var that = this;
    this.client.getCampaignByName(request, function(error, response) {
      that.callbackFnc(error, response, callback);
    });

  }

  buildCampaignRequest(campaignKey, impressionString) {
    LOGGER.info("campaignKey = %s" , campaignKey );
    var request = {
      campaignKey : campaignKey,
      request_header : {
        client_name: constants.CLIENT_NAME,
        request_identifier: impressionString
      }
    }

    LOGGER.info("CampaignRequest: " + JSON.stringify(request));

    return request;
  }

  callbackFnc(error, response, callback) {

    var adcCampaign = null;
    if(!error && typeof(response) != 'undefined') {
      LOGGER.info("CampaignResponse: " + JSON.stringify(response));

      if(typeof(response.response_header) != 'undefined' && typeof(response.response_header.status) != 'undefined'
        && response.response_header.status.toLowerCase() == constants.SUCCESS) {

        if(typeof(response.adcCampaign) != 'undefined') {
          adcCampaign = response.adcCampaign;
        }

      } else {
        LOGGER.error("Failed to get campaign. status=[%s], msg=[%s]",
          response.response_header.status, response.response_header.status_msg);
      }


    } else {
      LOGGER.error("Error getting campaign", error);
    }

    callback(error, adcCampaign);
  }
}
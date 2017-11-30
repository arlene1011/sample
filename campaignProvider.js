import bunyan from 'bunyan';
import CampaignService from '../../services/campaignService'

const LOGGER = bunyan.createLogger({name:'CampaignProvider'});

module.exports = class CampaignProvider {

  constructor() {
    LOGGER.info('CampaignProvider instantiated');

    this.campaignService = new CampaignService(this.logger);
  }

  provide(req, next) {
    let formContext = req.formContext;

    // use the cookie campaign name if not available from
    // campaign name or opaque string
    if(!formContext.campaignName && !formContext.opaqueStr) {
      if(formContext.cookies.lastCampaignName) {
        formContext.campaignName = formContext.cookies.lastCampaignName;
      } else {
        // todo default campaign here.
      }
    }

    if (typeof(formContext.campaignName) !== 'undefined') {
      this.campaignService.getCampaignByName(formContext.campaignName, formContext.impressionString,
        function (error, campaign) {
          if (!error && campaign) {
            formContext.setCampaign(campaign);
            next();
          } else {
            throw "Error getting campaign by name [" + formContext.campaignName + "]";
          }
        }
      );
    } else if (typeof(formContext.opaqueStr) !== 'undefined') {
      this.campaignService.getCampaignByOpaqueString(formContext.opaqueStr, formContext.impressionString,
        function (error, campaign) {
          if (!error && campaign) {
            formContext.setCampaign(campaign);
            next();
          } else {
            throw "Error getting campaign by opaqueStr [" + formContext.opaqueStr + "]";
          }
        }
      );
    }
  }
};
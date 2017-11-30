import bunyan from 'bunyan';
import FormContext from './formContext';

import UrlParamHashProvider from './providers/urlParamHashProvider';
import CampaignProvider from './providers/campaignProvider';
import ImpressionProvider from './providers/impressionProvider';
import LeadIdProvider from './providers/leadIdProvider';
import HttpRequestProvider from './providers/httpRequestProvider';
import CreativeProvider from './providers/creativeProvider';
import UserParamProvider from './providers/userParamProvider';
import UserAgentProvider from './providers/userAgentProvider';
import AlpsComponentsProvider from './providers/alpsComponentsProvider';
import WinnerPageProvider from './providers/winnerPageProvider';
import FormValidationProvider from './providers/formValidationProvider';
import LeadgenServicesProvider from './providers/leadgenServicesProvider';
import MatchAndCommitProvider from './providers/matchAndCommitProvider';
import LeadDeliveryProvider from './providers/leaddeliveryProvider';
import GeoLocationProvider from './providers/geoLocationProvider';
import PixelProvider from './providers/pixelProvider';
import TrackingDimensionProvider from './providers/trackingDimensionProvider';
import TrafficSourceProvider from './providers/trafficSourceProvider';
import DecryptedCampaignProvider from './providers/decryptedCampaignProvider';
import CookieHandlerProvider from './providers/cookieHandlerProvider';


import ChainInvoker from './chainInvoker';

const LOGGER = bunyan.createLogger({name:'FormController'});

module.exports = class FormController {

  constructor(logs) {
    LOGGER.info('FormController class created');

    // initialize all providers
    // this will provide contents for the form context
    this.GET_PROVIDERS = [
      new HttpRequestProvider(),
      new GeoLocationProvider(),
      new UserAgentProvider(),
      new UrlParamHashProvider(),
      new TrafficSourceProvider(),
      new CampaignProvider(),
      new CookieHandlerProvider(),
      new ImpressionProvider(),
      new WinnerPageProvider(),
      new CreativeProvider(),
      new TrackingDimensionProvider(),
      new UserParamProvider(),
      new AlpsComponentsProvider(),
      new PixelProvider()
    ];

    this.SUBMIT_PROVIDERS = [
      new HttpRequestProvider(),
      new GeoLocationProvider(),
      new UserAgentProvider(),
      new DecryptedCampaignProvider(),
      new LeadIdProvider(),
      new CampaignProvider(),
      new CreativeProvider(),
      new UserParamProvider(),
      new FormValidationProvider(),
      new LeadgenServicesProvider(),
      new AlpsComponentsProvider(),
      new MatchAndCommitProvider(),
      new LeadDeliveryProvider(),
      new PixelProvider()
    ];
  }

  handleGet(req, res, next) {
    FormController.handle(this.GET_PROVIDERS, req, res, next);
  };

  handleSubmit(req, res, next) {
    FormController.handle(this.SUBMIT_PROVIDERS, req, res, next);
  };

  static handle(providers, req, res, next, logs) {

    LOGGER.info('provide request context.');

    // in here we create the form context which will contain all information
    req.formContext = new FormContext();

    // delegate to invoker for chain call
    let invoker = new ChainInvoker(providers, 'provide', req, function() {
      req.formContext.cookies.store(res);

      next();
    });

    invoker.invoke();
  };
};
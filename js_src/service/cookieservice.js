/**
 * Service for interacting with cookies.
 */

goog.provide('ff.service.CookieService');

goog.require('goog.dom');
goog.require('goog.log');
goog.require('goog.net.Cookies');



/**
 * @constructor
 */
ff.service.CookieService = function() {

  /** @protected {goog.log.Logger} */
  this.logger = goog.log.getLogger('ff.service.CookieService');

  /** @private {!goog.net.Cookies} */
  this.cookies_ = new goog.net.Cookies(goog.dom.getDocument());
};
goog.addSingletonGetter(ff.service.CookieService);


/**
 * Gets the cookie identified by the name.
 * @param {string} cookieName
 * @return {string}
 */
ff.service.CookieService.prototype.get = function(cookieName) {
  return this.cookies_.get(cookieName) || '';
};


/**
 * Sets the new cookie value.
 * @param {string} cookieName
 * @param {string} value
 */
ff.service.CookieService.prototype.set = function(cookieName, value) {
  this.cookies_.set(cookieName, value);
};

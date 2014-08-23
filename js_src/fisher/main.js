/**
 * Main bootstrapping file which gets the entire application going.
 */

goog.provide('ff.fisher.Main');

goog.require('ff.fisher.ui.Root');
goog.require('goog.Disposable');
goog.require('goog.debug.Console');
/** @suppress {extraRequire} Needed for compilation warnings within closure. */
goog.require('goog.debug.ErrorHandler');
/** @suppress {extraRequire} Needed for compilation warnings within closure. */
goog.require('goog.events.EventWrapper');
goog.require('goog.log');



/**
 * The container for all the main components of the application.
 * @constructor
 * @extends {goog.Disposable}
 */
ff.fisher.Main = function() {
  goog.base(this);

  /** @protected {goog.log.Logger} */
  this.logger = goog.log.getLogger('ff.fisher.Main');

  // Set up logging for the entire application.
  if (!goog.debug.Console.instance) {
    goog.debug.Console.instance = new goog.debug.Console();
  }
  var console = goog.debug.Console.instance;
  console.setCapturing(true);
  goog.log.info(this.logger, 'Finished setting up logging');

  // Register an unload event to properly clean up resources.
  window.onbeforeunload = goog.bind(this.onUnload_, this);

  // Create and render the UI.
  var root = new ff.fisher.ui.Root();
  this.registerDisposable(root);
  root.render();
};
goog.inherits(ff.fisher.Main, goog.Disposable);


/**
 * Called when the application unloads.
 * @private
 */
ff.fisher.Main.prototype.onUnload_ = function() {
  this.disposeInternal();
};


/**
 * Main entry point to the program.  All bootstrapping happens here.
 */
ff.fisher.Main.bootstrap = function() {
  new ff.fisher.Main();
};


// Ensures the symbol will be visible after compiler renaming.
goog.exportSymbol('ff.fisher.Main.bootstrap', ff.fisher.Main.bootstrap);

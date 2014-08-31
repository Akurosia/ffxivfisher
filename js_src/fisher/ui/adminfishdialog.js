/**
 * The prompt to create a new game.
 */

goog.provide('ff.fisher.ui.AdminFishDialog');

goog.require('ff');
goog.require('ff.fisher.ui.soy');
goog.require('ff.model.Fish');
goog.require('ff.model.Weather');
goog.require('ff.service.FishService');
goog.require('ff.ui');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.log');
goog.require('goog.soy');
goog.require('goog.string');
goog.require('goog.structs');
goog.require('goog.structs.Set');
goog.require('goog.ui.Dialog');



/**
 * @param {ff.model.Fish=} opt_fish
 * @constructor
 * @extends {goog.ui.Dialog}
 */
ff.fisher.ui.AdminFishDialog = function(opt_fish) {
  goog.base(this);

  /** @protected {goog.log.Logger} */
  this.logger = goog.log.getLogger('ff.fisher.ui.AdminFishDialog');

  /** @private {!ff.service.FishService} */
  this.fishService_ = ff.service.FishService.getInstance();

  /** @private {ff.model.Fish} */
  this.fishToEdit_ = opt_fish || null;

  var titleText = 'Create a new fish';
  if (goog.isDefAndNotNull(this.fishToEdit_)) {
    titleText = 'Edit a fish';
  }
  this.setTitle(titleText);

  this.setDisposeOnHide(true);

  var buttonSet = new goog.ui.Dialog.ButtonSet()
      .addButton({
        key: ff.fisher.ui.AdminFishDialog.Id_.CONFIRM_BUTTON,
        caption: 'Save'
      }, true)
      .addButton(goog.ui.Dialog.ButtonSet.DefaultButtons.CANCEL, false, true);
  this.setButtonSet(buttonSet);
};
goog.inherits(ff.fisher.ui.AdminFishDialog, goog.ui.Dialog);


/**
 * @enum {string}
 * @private
 */
ff.fisher.ui.AdminFishDialog.Id_ = {
  CONFIRM_BUTTON: ff.getUniqueId('confirm-button'),
  END_HOUR_INPUT: ff.getUniqueId('end-hour-input'),
  NAME_INPUT: ff.getUniqueId('name-input'),
  START_HOUR_INPUT: ff.getUniqueId('start-hour-input'),
  WEATHER_INPUT: ff.getUniqueId('weather-input')
};


/**
 * Shows the dialog.
 */
ff.fisher.ui.AdminFishDialog.prototype.show = function() {
  this.setVisible(true);
};


/** @override */
ff.fisher.ui.AdminFishDialog.prototype.createDom = function() {
  goog.base(this, 'createDom');

  // Don't use setContent because that requires a string.  It doesn't make sense
  // to render the template as a string just to accommodate a limitation in the
  // dialog class.
  this.getContentElement().appendChild(goog.soy.renderAsElement(
      ff.fisher.ui.soy.ADMIN_FISH_DIALOG, {
        ids: this.makeIds(ff.fisher.ui.AdminFishDialog.Id_)
      }));

  var confirmButton = this.getButtonSet().getButton(
      ff.fisher.ui.AdminFishDialog.Id_.CONFIRM_BUTTON);

  goog.dom.setTextContent(this.getTitleCloseElement(), 'X');

  if (goog.isDefAndNotNull(this.fishToEdit_)) {
    this.setValue_(
        ff.fisher.ui.AdminFishDialog.Id_.NAME_INPUT,
        this.fishToEdit_.getName());

    // Set weather.
    var weatherStr = '';
    var first = false;
    goog.structs.forEach(this.fishToEdit_.getWeatherSet(), function(weather) {
      if (!first) {
        first = true;
      } else {
        weatherStr += ', ';
      }
      weatherStr += ff.model.Weather[weather];
    });
    this.setValue_(
        ff.fisher.ui.AdminFishDialog.Id_.WEATHER_INPUT,
        weatherStr);

    this.setValue_(
        ff.fisher.ui.AdminFishDialog.Id_.START_HOUR_INPUT,
        this.fishToEdit_.getStartHour() + '');
    this.setValue_(
        ff.fisher.ui.AdminFishDialog.Id_.END_HOUR_INPUT,
        this.fishToEdit_.getEndHour() + '');
  }
};


/**
 * Sets the value of the input to the given value.
 * @param {!ff.fisher.ui.AdminFishDialog.Id_} id
 * @param {string} value
 * @private
 */
ff.fisher.ui.AdminFishDialog.prototype.setValue_ = function(id, value) {
  ff.ui.getElementByFragment(this, id).value = value;
};


/** @override */
ff.fisher.ui.AdminFishDialog.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.getHandler().listen(this,
      goog.ui.Dialog.EventType.SELECT,
      this.onSelect_);
};


/** @override */
ff.fisher.ui.AdminFishDialog.prototype.focus = function() {
  goog.base(this, 'focus');
  ff.ui.getElementByFragment(this,
      ff.fisher.ui.AdminFishDialog.Id_.NAME_INPUT).focus();
};


/**
 * @param {!goog.ui.Dialog.Event} e
 * @private
 */
ff.fisher.ui.AdminFishDialog.prototype.onSelect_ = function(e) {
  if (ff.fisher.ui.AdminFishDialog.Id_.CONFIRM_BUTTON == e.key) {

    // Validate the name.
    var nameInput = ff.ui.getElementByFragment(this,
        ff.fisher.ui.AdminFishDialog.Id_.NAME_INPUT);
    var name = nameInput.value;
    if (goog.string.isEmptySafe(name)) {
      nameInput.select();
      e.preventDefault();
      return;
    }

    // Validate time.
    var startHour = this.getHour_(
        ff.fisher.ui.AdminFishDialog.Id_.START_HOUR_INPUT, e);
    if (startHour < 0) {
      return;
    }
    var endHour = this.getHour_(
        ff.fisher.ui.AdminFishDialog.Id_.END_HOUR_INPUT, e);
    if (endHour < 0) {
      return;
    }

    // Validate the weather.
    var weatherInput = ff.ui.getElementByFragment(this,
        ff.fisher.ui.AdminFishDialog.Id_.WEATHER_INPUT);
    var weatherString = weatherInput.value;
    var weatherSplits = weatherString.split(',');
    var weatherSet = new goog.structs.Set();
    var weatherInvalid = false;
    goog.array.forEach(weatherSplits, function(weatherSplit) {
      weatherSplit = goog.string.trim(weatherSplit);
      if (!goog.string.isEmptySafe(weatherSplit)) {
        var weather = ff.stringValueToEnum(weatherSplit, ff.model.Weather);
        if (weather) {
          weatherSet.add(weather);
        } else {
          weatherInvalid = true;
        }
      } else {
        weatherInvalid = true;
      }
    });
    if (weatherInvalid) {
      weatherInput.select();
      e.preventDefault();
      return;
    }

    if (goog.isDefAndNotNull(this.fishToEdit_)) {
      var updatedFish = new ff.model.Fish(
          this.fishToEdit_.getKey(), name, weatherSet, startHour, endHour);
      this.fishService_.update(updatedFish);
    } else {
      // Create the fish and store it.
      this.fishService_.create(
          new ff.model.Fish('', name, weatherSet, startHour, endHour));
    }
  }
  this.setVisible(false);
};


/**
 * Gets the hour value from the given input.
 * @param {!ff.fisher.ui.AdminFishDialog.Id_} id The id of the input.
 * @param {!goog.ui.Dialog.Event} e The submit event.
 * @return {number} The hour from the input or -1 if parse failed.
 * @private
 */
ff.fisher.ui.AdminFishDialog.prototype.getHour_ = function(id, e) {
  var input = ff.ui.getElementByFragment(this, id);
  var string = input.value;
  try {
    var hour = parseInt(string, 10);
    if (hour >= 0 && hour <= 23) {
      return hour;
    }
  } catch (error) {
  }

  // Invalid so cancel.
  input.select();
  e.preventDefault();
  return -1;
};

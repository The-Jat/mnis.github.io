/*global jQuery */

/**
 * Window resize based parallax animation.
 *
 * Concept / features
 * - Do a parallax on window width resizing only (no scrolling, gestures or mouse control).
 * - On-top layers show more of the effect, but you can set that manually ('data-depth').
 * - Show effect between min/max values only. Values depend on layout and image sizes.
 * - Animation is mostly variable and combined with CSS transitions.
 */
;jQuery(document).ready(function ($) {
  'use strict';

  var updateTimeout = 750,                 // How fast the view will update. Recommended: 500-1000 (with CSS transition) | 100-250 (without CSS transition). Update the CSS transitions too!
    dampening       = 0.8,                 // Dampen total shift for fine controlling smoother animations. Values: 0-1.
    shiftMax        = 200,                 // Base amount of pixels a layer can shift (multiplied by depth and dampening).
    maxWidth        = 1900,                // 1900px window width =   0% parallax shift
    minWidth        = 1000,                // 1000px window width = 100% parallax shift
    maxDifference   = maxWidth - minWidth, // 100% difference (= 100% parallax) for calculation.

    // Private (auto values)
    win             = $(window),           // Cache window object.
    layers          = $('.inner'),         // Parallax layer elements with 'data-depth' attribute.
    shiftPercentage = 0,                   // How many percent the view may shift.
    width           = 0,                   // Current window width, except browser scrollbar.
    timer;


  // ------------------------------------------------------------------------------------------------------- Functions

  /**
   * Unused feature: Auto-create depth values.
   *
   * This is not sufficient for this animation, but could work with other designs.
   */
  /*
  function createLayerDepth () {
    var i = 0;

    layers.each(function eachLayerDepth () {
      $(this).attr('data-depth', i++);
    });
  }
  */

  /**
   * Set percentage value for layer shifting ...
   * - if current window is smaller than the layer width (else disable the effect).
   * - if window size is above the minimum (else disable the effect).
   */
  function updateLayerShift () {
    if (maxWidth > width && width > minWidth) {

      shiftPercentage  = ((maxWidth - width) * 100 / maxDifference) | 0;
      shiftPercentage /= 100;
    }

    if (shiftPercentage <= 0.1) {
      shiftPercentage = 0;
    }
  }

  /**
   * Update parallax effect for each layer and shift active layers to the left side.
   */
  function updateLayerPosition () {
    layers.each(function eachLayerPosition () {

      var depth    = this.dataset.depth | 0,
        shiftValue = -((shiftMax * shiftPercentage) * depth * dampening) | 0;

      if (shiftValue < 0) {
        this.style.marginLeft = shiftValue + 'px';
      }
    });
  }


  // ------------------------------------------------------------------------------------------------------------- Run

  /**
   * Listen to window size updates and update the animation.
   *
   * If performance is critical , the timeouts should be used.
   * But in this case the animation by its nature works
   * only for resizeable desktop browsers, so we can omit it.
   *
   * (*1) Prevents to run multiple timeouts at the same time is
   *      a good performance optimization technique to prevent event overflow.
   *      But in this case it causes ugly animation issues.
   * (*2) This is normally a good technique too, but it causes the
   *      animation to behave strangely on start and end - when it leaves
   *      or re-enters the range where anything should happen.
   */
  win.on('resize', function onResize () {
    width = win.width();

    updateLayerShift();
    updateLayerPosition();

    /* (*1) * /
    if (timer) {
      clearTimeout(timer);
    }
    // */

    /* (*2) * /
    timer = window.setTimeout(function onTimeout() {
      width = win.width();
      updateLayerShift();
      updateLayerPosition();

    }, updateTimeout);
    // */
  });

});


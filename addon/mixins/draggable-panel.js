/* global Hammer */

import Ember from 'ember';

// Can only be mixed into ps-panel
export default Ember.Mixin.create({
  setupPanHammer: Ember.on('didInsertElement', function() {
    if (!this.get('draggable')) {
      return;
    }

    var panel = this;

    var hammer = new Hammer(this.$()[0], {
      touchAction: 'pan-y'
    });

    this.set('hammer', hammer);

    hammer.get('pan').set({
      direction: Hammer.DIRECTION_HORIZONTAL
    });

    hammer.on('panmove', function(event) {
        return panel.panmove(event);
    });

    hammer.on('panend', function(event) {
      return panel.panend(event);
    });
  }),

  threshold: Ember.computed('paneWidth', function() {
    return this.get('elWidth') * 0.30;
  }),

  disallowPan: Ember.computed.or('isPaneScrolling', 'animating'),

  disallowPanChanged: Ember.observer('disallowPan', 'hammer', function() {
    var hammer = this.get('hammer');
    if (!hammer) {
      return;
    }

    if (this.get('disallowPan')) {
      hammer.get('pan').set({enable: false});
    } else {
      hammer.get('pan').set({enable: true});
    }
  }),

  panmove: function(event) {
    var containerXOffset = this.get('containerXOffset');
    var offset           = containerXOffset + event.deltaX;

    var xSwipe = Math.abs(event.deltaX) >= Math.abs(event.deltaY);

      // animate only if pan is a horizontal swipe
    if (xSwipe) {
      Ember.$.Velocity(this.get('$container'), {
        translateX: offset
      }, { duration: 0 });
    }
  },

  panend: function(event) {
    return this.panChooseAnimation(event);
  },

  panChooseAnimation: function(event) {
    var deltaX = event.deltaX;
    var deltaY = event.deltaY;
    var xSwipe = Math.abs(deltaX) >= Math.abs(deltaY);

    var threshold = this.get('threshold');
    var prevPane  = this.get('prevPane');
    var nextPane  = this.get('nextPane');

    if (prevPane && (deltaX > threshold) && xSwipe) {
      return this.animateToPane(prevPane);

    } else if ((deltaX > 0) && xSwipe) {
      return this.animateToCurrentPane();

    } else if ((nextPane && Math.abs(deltaX) > threshold) && xSwipe) {
      return this.animateToPane(nextPane);

    } else {
      return this.animateToCurrentPane();
    }
  },
});

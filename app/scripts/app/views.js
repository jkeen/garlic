App.module("Views", function(Views, App, Backbone, Marionette, $, _){
  Views.App = Marionette.LayoutView.extend({
    template: "#app_template",
    
    id: "garlic_overlay_container",
    
    regions: {
      "timerRegion": "#timer_region",
      "messageRegion": "#message_region",
      "quoteRegion": "#quote_region"
    },
    
    initialize: function(options) {
      this.settings = options.settings;
    }
  });
  
  Views.Quote = Marionette.ItemView.extend({
    template: "#quote_template",

    className: 'quote'
  });

  Views.Message = Marionette.ItemView.extend({
    template: "#message_template",

    className: 'message'
  });
  
  Views.Timer = Marionette.ItemView.extend({
    template: "#timer_template",
  
    className: 'timer',
    
    initialize: function(options) {
      this.listenTo(App, "clock:tick", this.updateClock);
      this.options = options
    },
    
    serializeData: function() {
      return {
        site_url: this.options.site_url
      }
    },
  
    updateClock: function(data) {
      var time = Math.round(data.time_remaining / 1000)

      if (time < 10) time = "0" + time;
    
      this.$el.find(".remaining").html("00:" + time);
    }
  });
});
var App = new Backbone.Marionette.Application();

App.addRegions({
  "mainRegion": ".container",
});

/* Helpers
------------------------------------------------------------------------------------------------------ */

App.getSiteUrl = function(url) {
  var parser = document.createElement('a');
  parser.href = url;
  
  return parser.hostname.replace(/^www\./, ""); 
}

/* Reqres
------------------------------------------------------------------------------------------------------ */

// Colors, etc
App.reqres.setHandler("siteSettings", function(options) {
  var request = $.Deferred();
  var page = App.getSiteUrl(options.page_url)
  
  $.getJSON( chrome.extension.getURL('/scripts/data.json'), function(data) {
    var settings;
    
    if (data[page]) {
      var quotes   = data.any.quotes.concat(data[page].quotes);
      var messages = data.any.messages.concat(data[page].messages);
      settings = _.extend(data.any, data[page]);

      settings.quotes = quotes;
      settings.messages = messages
    }
    else {
      settings = data.any;
    }
    request.resolve(settings)
  })
  
  return request;
});


App.reqres.setHandler("siteMessages", function(options) {
  var request = $.Deferred();
  var page = App.getSiteUrl(options.page_url)
  
  $.getJSON( chrome.extension.getURL('/scripts/data.json'), function(data) {
    var settings;
    
    if (data[page]) {
      var quotes   = data.any.quotes.concat(data[page].quotes);
      var messages = data.any.messages.concat(data[page].messages);
      settings = _.extend(data.any, data[page]);

      settings.quotes = quotes;
      settings.messages = messages
    }
    else {
      settings = data.any;
    }
    request.resolve(settings)
  })
  
  return request;
});


/* Startup
------------------------------------------------------------------------------------------------------ */

App.on("start", function(options) {
  loadSettings = App.request('siteSettings', options)
  
  loadSettings.done(function(settings) {
    App.settings = settings;
    
    var Views    = App.module('Views');
    var Entities = App.module("Entities");
  
    var Messages = new Entities.Messages(settings.messages);
    var Quotes   = new Entities.Quotes(settings.quotes);
    var AppView  = new Views.App();
    
    AppView.on("before:show", function() {
      AppView.timerRegion.show( new Views.Timer({model: new Backbone.Model({site_url: App.getSiteUrl(options.page_url) }) }) );
      
      AppView.quoteRegion.show( new Views.Quote({ model: Quotes.at(0) }) );
      AppView.messageRegion.show(new Views.Message({ model: Messages.at(0) }));
      
      var defaultTimeout = 15 * 1000;
      App.trigger("start:timer", defaultTimeout);
    });
    
    App.mainRegion.show(AppView)
  })
});

/* Clock handling
------------------------------------------------------------------------------------------------------ */

App.on("start:timer", function(total) {
  var interval = 100;
  var remaining = total;
  
  $("body").attr('data-time_total', total)
  
  this.clock = window.setInterval(function() {
    remaining = remaining - interval;
    
    var data = {
      time_total: total,
      time_remaining: remaining,
      percent_remaining: Math.round((remaining / total) * 100),
      percent_passed: Math.round(((total-remaining) / total) * 100)
    }
    
    App.trigger("clock:tick", data);
    
    // Send zero event
    if (remaining <= 0) App.trigger("clock:zero", data);
    
  }, interval);
});


App.on("clock:zero", function(data) {
  window.clearInterval(this.clock);
  // window.parent.postMessage({action: 'close'}, '*');
});

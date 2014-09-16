var App = new Backbone.Marionette.Application();

App.addRegions({
  "mainRegion": ".container"
});

/* Helpers
------------------------------------------------------------------------------------------------------ */

App.getSiteUrl = function(url) {
  var parser = document.createElement('a');
  parser.href = url;
  
  return parser.hostname.replace(/^www\./, ""); 
}

App.setColors = function(settings) {
  var appearance = settings.appearance;

  // have to have different variables because lighten and darken calls are destructive
  var c = tinycolor(appearance.backgroundColor);
  var c2 = tinycolor(appearance.backgroundColor);
  var borderColor           = c.isLight() ? c.darken() : c.lighten();
  var backgroundBorderColor = c2.isLight() ? c2.lighten() : c2.darken();
  
  $(".surrounding-borders").css({'border-color': backgroundBorderColor.toHexString() });
  $(".surrounding-borders div").css({'background-color': borderColor.toHexString() });
}

App.chooseMessages = function(site, siteSettings, defaultSettings) {
  var Entities        = App.module("Entities");
  
  if (!siteSettings) siteSettings = {}
  
  var SiteQuotes      = new Entities.Quotes(siteSettings.quotes);
  var SiteMessages    = new Entities.Messages(siteSettings.messages);

  var DefaultQuotes   = new Entities.Quotes(defaultSettings.quotes);
  var DefaultMessages = new Entities.Messages(defaultSettings.messages);


  // Set so we know what collection this is when we need to save it.
  SiteQuotes.site     = site;
  SiteMessages.site   = site;

  var quote   = SiteQuotes.getNextUnseen() || DefaultQuotes.getNextUnseen() || SiteQuotes.getOldestSeen() || DefaultQuotes.getOldestSeen()
  var message = SiteMessages.getNextUnseen() || DefaultMessages.getNextUnseen() || SiteMessages.getOldestSeen() || DefaultMessages.getOldestSeen()

  return {
    message: message,
    quote: quote
  }
}

/* Reqres
------------------------------------------------------------------------------------------------------ */

// Return site colors, the best message, and the best quote for this site.
App.reqres.setHandler("loadPageSettings", function(options) {
  var request = $.Deferred();
  var siteUrl = App.getSiteUrl(options.page_url);

  chrome.runtime.sendMessage({action: 'getData', data: ['default', siteUrl]}, function(response) {
    var appearance = {};
    var attrs = ["backgroundColor", "borderColor", "textColor"];
    var defaultAppearance = _.pick(response.default, attrs);
    
    if (response[siteUrl]) {
      appearance = _.extend(defaultAppearance, _.pick(response[siteUrl], attrs));
    }
    else {
      appearance = defaultAppearance;
    }
    
    messages = App.chooseMessages(siteUrl, response[siteUrl], response.default)
    
    var results = {
      appearance: appearance,
      message: messages.message,
      quote: messages.quote,
      site_url: siteUrl
    }
      
    request.resolve(results);

    // Mark the items as seen and save them
    messages.message.markSeen();
    messages.quote.markSeen();
    
    var messageCollection = messages.message.collection;
    var quoteCollection = messages.quote.collection;
    
    var settings;
    settings = messageCollection.site ? response[siteUrl] : response.default
    settings.messages = messageCollection.toJSON();

    settings = quoteCollection.site ? response[siteUrl] : response.default
    settings.quotes = quoteCollection.toJSON();

    chrome.runtime.sendMessage({action: 'saveData', data: response}, function() {
      console.log('saved updated stuff')
    })
  });
  
  return request;
});

/* Startup
------------------------------------------------------------------------------------------------------ */

App.mainRegion.attachHtml = function(view) {
  this.$el.empty().append(view.el);
  this.$el.hide().fadeIn('fast');
}

App.on("start", function(options) {
  var Views    = App.module('Views');

  loadSettings = App.request('loadPageSettings', options);
  
  loadSettings.done(function(settings) {
    var AppView  = new Views.App({settings: settings.appearance});
    
    App.setColors(settings)
        
    AppView.on("before:show", function() {
      AppView.timerRegion.show(  new Views.Timer({site_url: settings.site_url }) );
      AppView.quoteRegion.show(  new Views.Quote({ model: settings.quote }) );
      AppView.messageRegion.show(new Views.Message({ model: settings.message }));
      
      var defaultTimeout = 15 * 1000;
      App.trigger("start:timer", defaultTimeout);
    });
    
    App.mainRegion.show(AppView)
  })
});

/* Clock handling
------------------------------------------------------------------------------------------------------ */

App.on("start:timer", function(total) {
  var interval = 1000;
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
  
  window.setTimeout(function() {
    App.mainRegion.$el.fadeOut('slow');
    window.parent.postMessage({action: 'close'}, '*');
    
  },500)
  
});

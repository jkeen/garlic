'use strict';

$.fn.bootstrapSwitch.defaults.size = 'small';
$.fn.bootstrapSwitch.defaults.onColor = 'success';
$.fn.bootstrapSwitch.defaults.animated = false;

chrome.runtime.sendMessage({action: 'getAllPageInfo'}, function(settings) {
  var Entities = App.module("Entities");
  var Views = App.module("Views");
  
  var SettingsCollection = new Entities.Settings(settings)
  var SettingsView = new Views.Settings({collection: SettingsCollection});

  $(".settings").html(SettingsView.render().el);
  
})


var App = new Backbone.Marionette.Application(); 

App.module("Views", function(Views, App, Backbone, Marionette, $, _){
  Views.Setting = Marionette.ItemView.extend({
    template: "#setting_row_template",
      
    className: 'site-setting',
    
    ui: {
      "checkbox": "input"
    },

    initialize: function() {
     
    },
    
    onRender: function() {
      var _this = this;
      this.ui.checkbox.bootstrapSwitch('state', this.model.get('state') === 'on');
        
      this.ui.checkbox.on('switchChange.bootstrapSwitch', function(event, state) {
        _this.model.set({state: (state ? 'on': 'off')});
      });

    }
  });

  Views.Settings = Marionette.CollectionView.extend({
    template: "#settings_template",
        
    childView: Views.Setting
  })
});


App.module("Entities", function(Entities, App, Backbone, Marionette, $, _){
  Entities.Setting = Backbone.Model.extend({
    defaults: {
      site_url: ""
    },
    
    initialize: function() {
      var _this = this;
      this.on("change:state", this.handleStateChange, this);
    },
    
    handleStateChange: function() {
      if (this.get('state') == 'on') {
        chrome.runtime.sendMessage({action: 'blockSite', site_url: this.get('site_url')}, function(response) {
        
        });
      }
      else {
        chrome.runtime.sendMessage({action: 'allowSite', site_url: this.get('site_url')}, function(response) {
        
        });
      }
    }
  });

  Entities.Settings = Backbone.Collection.extend({
    model: Entities.Setting
  });
});



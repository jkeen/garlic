App.module("Entities", function(Entities, App, Backbone, Marionette, $, _){
  Entities.Quote = Backbone.Model.extend({
    defaults: {
      site: "", // optional
      message: "",
      attribution: ""
    }
  });

  Entities.Message = Backbone.Model.extend({
    defaults: {
      site: "", // optional
      message: ""
    }
  })

  Entities.Quotes = Backbone.Collection.extend({
    model: Entities.Quote
  });
  
  Entities.Messages = Backbone.Collection.extend({
    model: Entities.Message
  });
});
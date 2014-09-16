App.module("Entities", function(Entities, App, Backbone, Marionette, $, _){
  var BaseModel = Backbone.Model.extend({ 
    defaults: {
      seen: undefined
    },
    markSeen: function() {
      this.set({seen: new Date().getTime()});
    }
  });

  var BaseCollection = Backbone.Collection.extend({ 
    getNextUnseen: function() {
      var result = this.findWhere({seen: undefined});
      
      if (result) result.markSeen();
      
      return result;
    },
    
    comparator: function(m) {
      if (!m.get('seen')) {
        return 0
      }
      
      return m.get('seen');
    },
    
    getOldestSeen: function() {
      return this.sort().at(0);
    }
  });
  
  Entities.Quote = BaseModel.extend({
    defaults: {
      site: "", // optional
      message: "",
      attribution: ""
    }
  });

  Entities.Message = BaseModel.extend({
    defaults: {
      site: "", // optional
      message: ""
    }
  });

  Entities.Quotes = BaseCollection.extend({
    model: Entities.Quote
  });
  
  Entities.Messages = BaseCollection.extend({
    model: Entities.Message
  });
});
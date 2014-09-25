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
      var results = this.where({seen: undefined});
      var result = _.sample(results)
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
    }
  });

  Entities.Message = BaseModel.extend({
    defaults: {
    }
  });

  Entities.Quotes = BaseCollection.extend({
    model: Entities.Quote
  });
  
  Entities.Messages = BaseCollection.extend({
    model: Entities.Message
  });
});
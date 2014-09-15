Marionette.TemplateCache.prototype.compileTemplate = function(rawTemplate) {

    // Mustache.parse will not return anything useful (returns an array)
    // The render function from Marionette.Renderer.render expects a function
    // so instead pass a partial of Mustache.render 
    // with rawTemplate as the initial parameter.

    // Additionally Mustache.compile no longer exists so we must use parse.
    Mustache.parse(rawTemplate);
    return _.partial(Mustache.render, rawTemplate);
};


window.addEventListener("message", function(event) {
  if (event.data && event.data.message == 'show_delay') {
    App.start(event.data);
  }
}, false);

// Sends the plugin the message to send along the initialization sequence
window.parent.postMessage({action: 'hello_from_garlic'}, '*');


App.on("start", function(options) {
  _gaq.push(['_trackPageview', options.page_url]);
});

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-719104-9']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
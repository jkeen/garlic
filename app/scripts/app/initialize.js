window.addEventListener("message", function(event) {
  if (event.data && event.data.message == 'show_delay') {
    App.start(event.data);
  }
}, false);

// Sends the plugin the message to send along the initialization sequence
window.parent.postMessage({action: 'hello_from_garlic'}, '*');
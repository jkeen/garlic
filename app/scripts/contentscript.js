var $frame,
    $frameContainer,
    $pageUrl,
    $visitHistory,
    $frameUrl,
    $settings,
    $settingsUrl,
    $settingsVisible = false;

function loadOverlay() {
  $frameContainer = document.getElementById("tbd_garlic_container");

  if (!$frameContainer) {
    if (!$frameUrl) return;
    
    $frameContainer = document.createElement('div');
    $frameContainer.setAttribute('id', 'tbd_garlic_container')
    
    var $frame = document.createElement('iframe');
    $frame.setAttribute('id', 'tbd_garlic_frame');
    $frame.setAttribute('src', $frameUrl);
    $frame.setAttribute('scrolling', 'no' );
    $frame.setAttribute('frameBorder', '0' );
    // f.setAttribute('style', 'display:none');
    $frame.setAttribute('allowtransparency', 'true');
    
    $frameContainer.appendChild($frame);
    
    document.body.insertBefore($frameContainer, document.body.firstChild);
    $frameContainer = document.getElementById("tbd_garlic_container");
  }
}

function showSettings(settingsUrl) {
  $settings = document.getElementById("tbd_garlic_settings_container");

  if (!$settings) {
    $settings = document.createElement('div');
    $settings.setAttribute('id', 'tbd_garlic_settings_container')
    
    var f = document.createElement('iframe');
    f.setAttribute('id', 'tbd_garlic_settings');
    f.setAttribute('src', settingsUrl);
    f.setAttribute('scrolling', 'no' );
    f.setAttribute('frameBorder', '0' );
    // f.setAttribute('style', 'display:none');
    f.setAttribute('allowtransparency', 'true');
    
    $settings.appendChild(f);
    
    document.body.appendChild($settings);
  }
  
  window.setTimeout(function() {
    document.body.setAttribute('tbd-garlic-settings-visible', true);
  }, 200)
}

function toggleSettings(settingsUrl) {
  (document.body.getAttribute('tbd-garlic-settings-visible') ? hideSettings : showSettings)(settingsUrl);
}

function hideOverlay() {
  document.body.removeAttribute('tbd-garlic-active');
  
  window.setTimeout(function() {
    $frameContainer = document.getElementById('tbd_garlic_container');
    $frameContainer.parentNode.removeChild($frameContainer);
  }, 1000);
}

function hideSettings() {
  document.body.removeAttribute('tbd-garlic-settings-visible');
  
  window.setTimeout(function() {
    $settings = document.getElementById('tbd_garlic_settings_container')
  }, 500);
}

function sendMessageToFrame(data, origin) {
  $frame = document.getElementById('tbd_garlic_frame');
  $frame.contentWindow.postMessage(data, "*");
}

// Sent from the iFrame
window.addEventListener("message", function(e) {
  var data = e.data;

  if (data.action == 'hello_from_garlic') {
    sendMessageToFrame({ message: 'show_delay', page_url: $pageUrl, visit_history: $visitHistory });
    // happens the first time the frame opens up
    document.body.setAttribute('tbd-garlic-active', true);
  }
  if (data.action == 'close') {
    hideOverlay();
  }
  else if (data.action == 'closeSettings') {
    hideSettings();
  }
}, false);


// Sent from the extension
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // The page action button was clicked
  if (request.action == 'settings') {
    toggleSettings(request.url);
    sendResponse({visibility: $settingsVisible});
  }
  else if (request.action == 'closeSettings') {
    hideSettings()
  }
});

// Initialization sequence
chrome.runtime.sendMessage({action: "getPageInfo"}, function(response) {
  if (response.blocked) {
    chrome.runtime.sendMessage({action: "showDelay"}, function(data) {
      $frameUrl     = data.frame_url;
      $pageUrl      = data.page_url;
      $visitHistory = data.visit_history;
      
      loadOverlay()
    });
  }
});

$(function() {
  $.fn.bootstrapSwitch.defaults.size = 'large';
  $.fn.bootstrapSwitch.defaults.onColor = 'success';
  $.fn.bootstrapSwitch.defaults.animated = false;

  chrome.runtime.sendMessage({action: "getPageInfo"}, function(response) {
    $("#delay_this_site").bootstrapSwitch('state', response.blocked);
    
    $(".site-url").html(response.site_url);
    
    $('#delay_this_site').on('switchChange.bootstrapSwitch', function(event, state) {
      if (!state) {
        chrome.runtime.sendMessage({action: 'allowSite'}, function(response) {
          window.parent.postMessage({action: 'close'}, '*');
        
          window.setTimeout(function() {
            window.parent.postMessage({action: 'closeSettings'}, '*');
          }, 1000);
        
        });
      }
      else {
        chrome.runtime.sendMessage({action: 'blockSite'}, function(response) {
          window.setTimeout(function() {
            window.parent.postMessage({action: 'closeSettings'}, '*');
          }, 1000);
        });
      }
    });
    
  });

  $('button.close').on('click', function(e) {
    window.parent.postMessage({action: 'closeSettings'}, '*');
  });
});
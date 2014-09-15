$(function() {
  $.fn.bootstrapSwitch.defaults.size = 'large';
  $.fn.bootstrapSwitch.defaults.onColor = 'success';


  chrome.runtime.sendMessage({action: "isPageBlocked"}, function(pageIsBlocked) {
    $("#delay_this_site").bootstrapSwitch('state', pageIsBlocked);
  });

  $("#delay_this_site").bootstrapSwitch('state', false);

  $('#delay_this_site').on('switchChange.bootstrapSwitch', function(event, state) {
    chrome.runtime.sendMessage({action: 'saveSettings', data: {delay_active: state}}, function(response) {
      window.setTimeout(function() {
        window.parent.postMessage({action: 'closeSettings'}, '*');
      }, 1000);
    });
  });

  $('button.close').on('click', function(e) {
    window.parent.postMessage({action: 'closeSettings'}, '*');
  });
});
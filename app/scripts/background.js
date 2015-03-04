'use strict';

var _blockedPages, _data, _history = {};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  var tab = sender.tab;
  var pageUrl = tab.url
  var siteUrl = getSiteUrl(pageUrl);
    
  if (request.action === 'showDelay') {
    var frameUrl = chrome.extension.getURL("overlay.html");
    sendResponse({ frame_url: frameUrl, page_url: pageUrl });
    updateIcon(true)
  }

  else if (request.action === 'getPageInfo') {
    // sent from popup not from content window, so we have to query still
    var blocked = isPageBlocked(siteUrl) && !isPageExcluded(pageUrl);

    updateIcon(blocked)
    
    sendResponse({ blocked: blocked, site_url: siteUrl, firstVisit: firstVisit(pageUrl, request.referrer) });
  }

  else if (request.action == 'getAllPageInfo') {
    // Used for the initial options screen
    var settings = [];
    
    _.each(Object.keys(_blockedPages), function(site) {
      if (_blockedPages[site] === true) {
        settings.push({site_url: site, state: 'on'})
      }
    })
    
    sendResponse(settings);
  }
  
  else if (request.action === 'blockSite') {
    blockPage((request.site_url || siteUrl));
    if (!request.site_url) updateIcon(true)
    sendResponse(request);
  }

  else if (request.action === 'allowSite') {
    allowPage((request.site_url || siteUrl));
    if (!request.site_url) updateIcon(false);
    sendResponse(request);
  }
  
  else if (request.action === 'getData') {
    sendResponse(_.pick(_data, request.data));
  }
  
  else if (request.action === 'saveData') {
    _data = _.extend(_data, request.data);

    sendResponse(_data);
  }
});

chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason == "install") {
      setDefaults();
      chrome.tabs.create({url: chrome.extension.getURL("options.html"), selected: true }, function(callback) {
          
      });
    }
    else if (details.reason == "update") {
      load() // reload default data
    }
});

// chrome.history.onVisited.addListener(function(item) {
//
//   var url = item.url;
//   var blocked = isPageBlocked(url);
//
//   if (blocked) {
//     chrome.tabs.query({url: url, status: "loading"}, function(tabs) {
//       tabs[0].executeScript("document.body.style='display:none;");
//     })
//   }
// });
//

chrome.browserAction.onClicked.addListener(function actionClicked(tab) {
  chrome.tabs.sendMessage(tab.id, {action: "settings", url: chrome.extension.getURL("popup.html")}, function(response) {
    // settings are being shown

  });
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
   // for (var key in changes) {
   //   var storageChange = changes[key];
   //   console.log('Storage key "%s" in namespace "%s" changed. ' +
   //               'Old value was "%O", new value is "%O".',
   //               key,
   //               namespace,
   //               storageChange.oldValue,
   //               storageChange.newValue);
   // }
 });

chrome.tabs.onActivated.addListener(function(data) {
  chrome.tabs.get(data.tabId, function(tab) {
    var pageUrl = tab.url
    var siteUrl = getSiteUrl(pageUrl)
    var blocked = isPageBlocked(siteUrl);
    updateIcon(blocked);
  });
});

function updateIcon(active) {
  chrome.browserAction.setIcon({path : (active? 'images/icon_on.png' : 'images/icon_off.png')});
}

function isPageExcluded(pageUrl) {
  if (pageUrl && pageUrl.match(/oauth/)) {
    return true;
  }
  
  return false;
}

function isPageBlocked(pageUrl) {
  return _blockedPages[pageUrl];
}

function firstVisit(current, previous) {
  return (getSiteUrl(current) != getSiteUrl(previous));
}

function blockPage(pageUrl) {
  if (typeof pageUrl === 'string') pageUrl = [pageUrl]
  
  _.each(pageUrl, function(url) {
    _blockedPages[ url ] = true;
  });

  saveBlockedPages();
}

function allowPage(pageUrl) {
  if (typeof pageUrl === 'string') pageUrl = [pageUrl]
  
  _.each(pageUrl, function(url) {
    _blockedPages[ url ] = false;
  });

  saveBlockedPages();
}

function saveBlockedPages() {
  chrome.storage.sync.set({'_blockedPages': _blockedPages}, function() {
  });
}

function getSiteUrl(url) {
  var parser = document.createElement('a');
  parser.href = url;
  
  // parser.protocol; // => "http:"
  // parser.hostname; // => "example.com"
  // parser.port;     // => "3000"
  // parser.pathname; // => "/pathname/"
  // parser.search;   // => "?search=test"
  // parser.hash;     // => "#hash"
  // parser.host;     // => "example.com:3000"
  
  return parser.hostname.replace(/^www\./, ""); 
}

chrome.browserAction.setBadgeText({text: ''});

function setDefaults() {
  var defaults = []
  
  _.each(Object.keys(_data), function(site) {
    if (_data[site].default) {
      defaults.push(site)
    }
  });
  
  blockPage(defaults);
}


// This happens when the extension first loads
function load() {
  _data = window._defaultData;
  
  chrome.storage.sync.get(['_blockedPages'], function(response) {
    if (typeof response._blockedPages == 'undefined') {
      _blockedPages = {};
    }
    else {
      _blockedPages = response._blockedPages;
    }
  });
}
load();



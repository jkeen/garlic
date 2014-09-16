'use strict';

var _blockedPages, _pageVisits, _data;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  var tab = sender.tab;
  
  if (request.action === 'showDelay') {
    var visits   = _pageVisits[ getSiteUrl(tab.url) ];
    var frameUrl = chrome.extension.getURL("overlay.html");
    var pageUrl  = tab.url;
    sendResponse({ frame_url: frameUrl, page_url: pageUrl, visit_history: visits });
    logPageVisit(tab.url);
    updateIcon(true)
  }

  else if (request.action === 'getPageInfo') {
    // sent from popup not from content window, so we have to query still
    var blocked = isPageBlocked(tab.url);
    updateIcon(blocked)
    
    sendResponse({blocked: blocked, site_url: getSiteUrl(tab.url)});
  }
  
  else if (request.action === 'blockSite') {
    blockPage(tab.url);
    updateIcon(true)
    sendResponse(request);
  }

  else if (request.action === 'allowSite') {
    allowPage(tab.url);
    updateIcon(false)
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

chrome.browserAction.onClicked.addListener(function actionClicked(tab) {
  chrome.tabs.sendMessage(tab.id, {action: "settings", url: chrome.extension.getURL("popup.html")}, function(response) {
    // settings are being shown

  });
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
   for (var key in changes) {
     var storageChange = changes[key];
     console.log('Storage key "%s" in namespace "%s" changed. ' +
                 'Old value was "%O", new value is "%O".',
                 key,
                 namespace,
                 storageChange.oldValue,
                 storageChange.newValue);
   }
 });

chrome.tabs.onActivated.addListener(function(data) {
  chrome.tabs.get(data.tabId, function(tab) {
    var blocked = isPageBlocked(tab.url);
    updateIcon(blocked);
  });
});

// chrome.runtime.onInstalled.addListener(function (details) {
//   $.getJSON( chrome.extension.getURL('/scripts/data.json'), function(data) {
//     _data = data;
//
//
//     // chrome.storage.sync.set(data, function() {
//     //   console.log("stored initial json file")
//     // })
//   });
//
//   console.log('previousVersion', details.previousVersion);
// });

function updateIcon(active) {
  chrome.browserAction.setIcon({path : (active? 'images/icon_on.png' : 'images/icon_off.png')});
}

function isPageBlocked(pageUrl) {
  if (pageUrl && pageUrl.match(/oauth/)) {
    return false;
  }
  
  return _blockedPages[getSiteUrl(pageUrl)];
}

function logPageVisit(pageUrl) {
  var visits = _pageVisits[getSiteUrl(pageUrl)];
  if (!visits) visits = [];
  visits.push(new Date());

  _pageVisits[getSiteUrl(pageUrl)] = visits;
}

function blockPage(pageUrl) {
  _blockedPages[ getSiteUrl(pageUrl) ] = true;
  saveBlockedPages();
}

function allowPage(pageUrl) {
  delete _blockedPages[ getSiteUrl(pageUrl) ];
  saveBlockedPages();
}

function saveBlockedPages() {
  chrome.storage.sync.set({'_blockedPages': _blockedPages}, function() {
    console.log("saved blocked pages");
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



// This happens when the extension first loads
function load() {
  // $.getJSON( chrome.extension.getURL('/scripts/data.json'), function(data) {
    _data = window._defaultData;
    
    
    // chrome.storage.sync.set(data, function() {
    //   console.log("stored initial json file")
    // })
  // });
  
  chrome.storage.sync.get(['_blockedPages', '_pageVisits', '_messageHistory'], function(response) {
  
    if (typeof response._blockedPages == 'undefined') {
      _blockedPages = {};
    }
    else {
      _blockedPages = response._blockedPages;
    }
    
  
    if (typeof response._pageVisits == 'undefined') {
      _pageVisits = {};
    }
    else {
      _pageVisits = response._pageVisits;
    }
  });
}
load();



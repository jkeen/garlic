'use strict';

var blockedPages, pageVisits;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  handleMessage(request, sender.tab, sendResponse);
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

chrome.runtime.onInstalled.addListener(function (details) {
  $.getJSON( chrome.extension.getURL('/scripts/data.json'), function(data) {
    chrome.storage.sync.set(data, function() {
      console.log("stored initial json file")
    })
  });
  
  console.log('previousVersion', details.previousVersion);
});

function handleMessage(request, tab, sendResponse) {
  if (request.action == 'showDelay') {
    var visits = pageVisits[ getSiteUrl(tab.url) ];
    var frameUrl = chrome.extension.getURL("overlay.html");
    var pageUrl = tab.url;
    sendResponse({ frame_url: frameUrl, page_url: pageUrl, visit_history: visits });
    logPageVisit(tab.url);
    updateIcon(true)
  }

  else if (request.action == 'isPageBlocked') {
    // sent from popup not from content window, so we have to query still
    var blocked = isPageBlocked(tab.url);
    updateIcon(blocked)
    sendResponse(blocked);
  }
  
  else if (request.action == 'saveSettings') {
    if (request.data.delay_active) {
      blockPage(tab.url);
      updateIcon(true)
    }
    else {
      allowPage(tab.url);
      updateIcon(false)
    }
    
    sendResponse(request.data);
  }
}


function updateIcon(active) {
  chrome.browserAction.setIcon({path : (active? 'images/icon_on.png' : 'images/icon_off.png')});
}

function isPageBlocked(pageUrl) {
  return blockedPages[getSiteUrl(pageUrl)];
}

function logPageVisit(pageUrl) {
  var visits = pageVisits[getSiteUrl(pageUrl)];
  if (!visits) visits = [];
  visits.push(new Date());

  pageVisits[getSiteUrl(pageUrl)] = visits;

  chrome.storage.sync.set({'pageVisits': pageVisits}, function() {
    console.log("saved page visits pages");
  });
}

function blockPage(pageUrl) {
  var u = getSiteUrl(pageUrl);
  
  blockedPages[u] = true;
  saveBlockedPages();
}

function allowPage(pageUrl) {
  var u = getSiteUrl(pageUrl);
  
  delete blockedPages[u];
  saveBlockedPages();
}

function saveBlockedPages() {
  chrome.storage.sync.set({'blockedPages': blockedPages}, function() {
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

function load() {
  chrome.storage.sync.get(['blockedPages', 'pageVisits'], function(pages, visits) {
  
    if (typeof blockedPages == 'undefined') {
      blockedPages = {};
    }
    else {
      blockedPages = JSON.parse(pages);
    }
    
  
    if (typeof pageVisits == 'undefined') {
      pageVisits = {};
    }
    else {
      pageVisits = JSON.parse(visits);
    }
  });
}
load();



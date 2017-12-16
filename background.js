//Create a new tab on click
chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.create({ 'url': chrome.extension.getURL('popup.html')} );
});

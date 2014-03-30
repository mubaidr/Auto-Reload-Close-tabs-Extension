// Copyright 2013 Paul Fournel

// Change this value to change remote server URL

chrome.runtime.onInstalled.addListener(function (details) {
	if (details.reason == "install") {
		chrome.storage.local.set({
			"remoteURL": "http://www.techiteens.com/freelance/settings.json",
			"adminTimer": 60000,
			"domainsAdmin": JSON.stringify([]),
			"domainsAdminUp": JSON.stringify([])
		});
		chrome.tabs.create({
			url: "splash.html",
			active: true
		});
	} else if (details.reason == "update") {
		var thisVersion = chrome.runtime.getManifest().version;
		console.log("Prev vesion: " + details.previousVersion);
		console.log("New version: " + thisVersion);

		chrome.tabs.create({
			url: "options.html",
			active: true
		});
	}
});

var validSettings = true,
	adminTimer = 60000;
chrome.storage.local.get("adminTimer", function (result) {
	if (result.adminTimer != null) {
		adminTimer = result.adminTimer
	}
});

chrome.extension.onMessage.addListener(
	function (request, sender, sendResponse) {
		if (request.action == "closeSite") {
			var domains, domainsAdmin, domainsUp, domainsAdminUp;
			chrome.storage.local.get([
				"domains",
					"domainsAdmin",
					"domainsUp",
					"domainsAdminUp"
			], function (result) {
				domains = result.domains;
				domainsAdmin = result.domainsAdmin;
				domainsUp = result.domainsUp;
				domainsAdminUp = result.domainsAdminUp;
				listOfSites = JSON.parse(domains);
				listOfSitesAdmin = JSON.parse(domainsAdmin);
				listOfSitesUp = JSON.parse(domainsUp);
				listOfSitesAdminUp = JSON.parse(domainsAdminUp);
				sendResponse({
					data: listOfSites.concat(listOfSitesAdmin),
					dataUp: listOfSitesUp.concat(listOfSitesAdminUp),
					valid: validSettings
				});
			});
		} else if (validSettings) {
			if (request.action == "alertTab") {
				if (request.reason == "closed") {
					chrome.tabs.executeScript(sender.tab.id, {
						file: "notifyClose.js"
					});
				} else {
					chrome.tabs.executeScript(sender.tab.id, {
						file: "notifyUpdate.js"
					});
				}
			} else if (request.action == "updateTab") {
				chrome.tabs.reload(sender.tab.id);
			} else if (request.action == "closeTab") {
				chrome.tabs.remove(sender.tab.id);
			} else if (request.action == "injectScript") {
				checkData();
				setTimeout(injectScript, 3000);
			}
		}
	});

function injectScript() {
	chrome.tabs.getAllInWindow(null, function (tabs) {
		for (var i = 0; i < tabs.length; i++) {
			chrome.tabs.executeScript(tabs[i].id, {
				file: 'hack.js'
			});
		}
	});
}

function checkData() {
	var remoteURL;
	chrome.storage.local.get("remoteURL", function (result) {
		remoteURL = result.remoteURL;
		try {
			$.ajax({
				url: remoteURL,
				dataType: "json"
			}).success(function (obj) {
				//console.log(JSON.stringify(obj[1]));
				chrome.storage.local.set({
					"domainsAdmin": JSON.stringify(obj[1]),
					"domainsAdminUp": JSON.stringify(obj[2]),
					//"adminTimer": parseInt(obj[0]) * 60 * 1000
					"adminTimer": parseInt(obj[0]) * 60 * 1000,
					"reload": true
				}, function () {
					injectScript();
					reloadOptions();
				});
			}).fail(function () {
				validSettings = false;
			});
		} catch (e) {
			console.log(e);
			validSettings = false;
		}
	});
}

checkData();
window.setInterval(function () {
	checkData();
}, adminTimer);

function reloadOptions() {
	var windows = chrome.extension.getViews({
		type: 'tab'
	});
	for (var i = 0; i < windows.length; i++) {
		windows[i].showData();
	}
}
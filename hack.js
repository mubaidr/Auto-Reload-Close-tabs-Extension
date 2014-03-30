// Copyright 2013 Paul Fournel


var vv, vw;

closeTab = function () {
	chrome.extension.sendMessage({
		action: "closeTab"
	});
};

AlertTab = function (reason) {
	console.log(reason, "alert");
	chrome.extension.sendMessage({
		action: "alertTab",
		reason: reason
	});
};

UpdateTab = function () {
	chrome.extension.sendMessage({
		action: "updateTab"
	});
};

chrome.extension.sendMessage({
	action: "closeSite",
	url: location.href
}, function (response) {
	//clearTimeout(vv);
	currentURL = location.href;
	if (response.valid) {
		response.data.forEach(function (val, k) {
			//console.log(val.name);
			if (currentURL.indexOf(val.name) != -1) {
				console.log("closeSite", val.name, val.time);
				vw = setTimeout(function () {
					AlertTab("closed");
				}, (60 * 1000 * val.time) - 10000);
				vv = setTimeout(function () {
					closeTab();
				}, (60 * 1000 * val.time));

				document.onmousemove = function (e) {
					clearTimeout(vw);
					clearTimeout(vv);
					vw = window.setTimeout(function () {
						AlertTab("closed");
					}, (60 * 1000 * val.time) - 10000);
					vv = window.setTimeout(function () {
						closeTab();
					}, (60 * 1000 * val.time));
					removeNotification();
				}
				return true;
			}
		});
		response.dataUp.forEach(function (val, k) {
			//console.log(val.name);
			if (currentURL.indexOf(val.name) != -1) {
				vw = window.setTimeout(function () {
					AlertTab("updated");
				}, (60 * 1000 * val.time) - 10000);
				vv = window.setTimeout(function () {
					UpdateTab();
				}, (60 * 1000 * val.time));

				document.onmousemove = function (e) {
					clearTimeout(vw);
					clearTimeout(vv);
					vw = window.setTimeout(function () {
						AlertTab("updated");
					}, (60 * 1000 * val.time) - 10000);
					vv = window.setTimeout(function () {
						UpdateTab();
					}, (60 * 1000 * val.time));
					removeNotification();
				}
				return true;
			}
		});
	}
});

function removeNotification() {
	var element = document.getElementById("close_banner_notify");
	if (element != null) {
		element.parentNode.removeChild(element);
	}
	var element = document.getElementById("update_banner_notify");
	if (element != null) {
		element.parentNode.removeChild(element);
	}
}
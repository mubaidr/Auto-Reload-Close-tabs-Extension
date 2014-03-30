function save_options() {
	var domainArray = [];
	var domainArrayUp = [];

	$(".domain").each(function (val, k) {
		var obj = {
			"name": $(this).attr('data-name'),
			"time": $(this).attr('data-time')
		};
		domainArray.push(obj);
	});

	$(".domainUp").each(function (val, k) {
		var obj = {
			"name": $(this).attr('data-name'),
			"time": $(this).attr('data-time')
		};
		domainArrayUp.push(obj);
	});

	chrome.storage.local.set({
		"remoteURL": $("#adminSec").val(),
		"domains": JSON.stringify(domainArray),
		"domainsUp": JSON.stringify(domainArrayUp)
	}, function () {
		chrome.extension.sendMessage({
			action: "injectScript"
		});
		showData();
	});
	// Update status to let user know options were saved.
	var status = document.getElementById("status");
	status.style.color = "Green";
	status.innerHTML = "Options Saved.";
	window.setTimeout(function () {
		status.innerHTML = "";
	}, 1500);
}

//-------------------------
// Chargement des données !
//-------------------------
var _domains, _domainsUp, _domainsAdmin, _domainsAdminUp;
showData();

function showData() {
	console.log("loading..");
	chrome.storage.local.get([
	"domains",
		"domainsUp",
		"domainsAdmin",
		"domainsAdminUp"
], function (result) {
		$("#domain").empty();
		$("#domainUp").empty();

		_domains = result.domains;
		_domainsUp = result.domainsUp;
		_domainsAdmin = result.domainsAdmin;
		_domainsAdminUp = result.domainsAdminUp;
		var domains = _domains !== null ? JSON.parse(_domains) : null;
		var domainsUp = _domainsUp !== null ? JSON.parse(_domainsUp) : null;
		var domainsAdmin = _domainsAdmin !== null ? JSON.parse(_domainsAdmin) : null;
		var domainsAdminUp = _domainsAdminUp !== null ? JSON.parse(_domainsAdminUp) : null;
		if (domainsAdmin !== null) {
			domainsAdmin.forEach(function (val, k) {
				var selectedHTML = '';
				$("#domain").append('<div class="domainAdmin" data-name="' + val.name + '" data-time="' + val.time + '"><div class="name">' + val.name + '</div><span class="minuts">(' + val.time + 'min)</span><div class="close">x</div></div>');
			});
		}
		if (domainsAdminUp !== null) {
			domainsAdminUp.forEach(function (val, k) {
				var selectedHTML = '';
				$("#domainUp").append('<div class="domainAdmin" data-name="' + val.name + '" data-time="' + val.time + '"><div class="nameUp">' + val.name + '</div><span class="minutsUp">(' + val.time + 'min)</span><div class="close">x</div></div>');
			});
		}
		if (domains !== null) {
			domains.forEach(function (val, k) {
				var selectedHTML = '';
				$("#domain").append('<div class="domain" data-name="' + val.name + '" data-time="' + val.time + '"><div class="name">' + val.name + '</div><span class="minuts">(' + val.time + 'min)</span><div class="close">x</div></div>');
			});
		}
		if (domainsUp !== null) {
			domainsUp.forEach(function (val, k) {
				var selectedHTML = '';
				$("#domainUp").append('<div class="domainUp" data-name="' + val.name + '" data-time="' + val.time + '"><div class="nameUp">' + val.name + '</div><span class="minutsUp">(' + val.time + 'min)</span><div class="close">x</div></div>');
			});
		}
	});
	chrome.storage.local.get("remoteURL", function (result) {
		$("#adminSec").val(result.remoteURL);
	});
	//Ajout de domaines
	$("#addDomain").on("click", function () {
		var name = $("#newdomain").val();
		var time = parseInt($("#sec").val());
		if (name === null || name === "" || time === null || time === 0) {
			// Update status to let user know URL is invalid.
			var status = document.getElementById("status");
			status.innerHTML = "Invalid Domain name or timing!";
			status.style.color = "Red";
			window.setTimeout(function () {
				status.innerHTML = "";
			}, 1500);
		} else {
			$("#domain").append('<div class="domain" data-name="' + name + '" data-time="' + time + '"><div class="name">' + name + '</div><span class="minuts">(' + time + 'min)</span><div class="close">x</div></div>');
			save_options();
		}
	});

	$(".domain").on("click", function () {
		$(this).remove();
		save_options();
	});

	$("#addDomainUp").on("click", function () {
		var name = $("#newdomainUp").val();
		var time = parseInt($("#secUp").val());
		if (name === null || name === "" || time === null || time === 0) {
			// Update status to let user know URL is invalid.
			var status = document.getElementById("status");
			status.innerHTML = "Invalid Domain name or timing!";
			status.style.color = "Red";
			window.setTimeout(function () {
				status.innerHTML = "";
			}, 1500);
		} else {
			$("#domainUp").append('<div class="domainUp" data-name="' + name + '" data-time="' + time + '"><div class="nameUp">' + name + '</div><span class="minutsUp">(' + time + 'min)</span><div class="close">x</div></div>');
			save_options();
		}
	});

	$(".domainUp").on("click", function () {
		$(this).remove();
		save_options();
	});

	//Intervalles de temps entre deux checkups
	$("#timeInterval").on("click", function () {
		var remoteURL = $("#adminSec").val();
		if (remoteURL !== null && remoteURL !== "") {
			//localStorage["remoteURL"] = remoteURL;
			chrome.storage.local.set({
				"remoteURL": remoteURL
			}, function () {
				checkData();
			});
		} else {
			/*Update status to let user know URL is invalid.*/
			var status = document.getElementById("status");
			status.innerHTML = "Invalid remote server address.";
			status.style.color = "Red";
			window.setTimeout(function () {
				status.innerHTML = "";
			}, 1500);
		}
	});

	//Les onglets
	$("#closeOnglet").on("click", function () {
		$("#menu .title").removeClass("selected");
		$(this).addClass("selected");
		$(".onglet").addClass("hide");
		$("#close").removeClass("hide");
	});

	$("#updateOnglet").on("click", function () {
		$("#menu .title").removeClass("selected");
		$(this).addClass("selected");
		$(".onglet").addClass("hide");
		$("#update").removeClass("hide");
	});
}

//------------------
//Gestion des clicks
//------------------

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
					"adminTimer": parseInt(obj[0]) * 60 * 1000
				}, function () {
					injectScript();
					save_options();
				});
			}).fail(function () {
				/*Update status to let user know URL is invalid.*/
				var status = document.getElementById("status");
				status.innerHTML = "Failed to obtain settings file.";
				status.style.color = "Red";
				window.setTimeout(function () {
					status.innerHTML = "";
				}, 1500);
			});
		} catch (e) {
			console.log(e);
		}
	});
}
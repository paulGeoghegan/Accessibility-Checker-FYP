
let reportList;

$.get("/getReports").done(function(data) {
	reportList = data;
	let table = $("<table>");
	let tableBody = $("<tbody>");

	//Clears table body
	tableBody.empty();

	table.append("<thead><tr><th>Name</th><th>Page Link</h><th>Created</th><th>Action</th></tr></thead>");

	for(let report of reportList) {
		tableBody.append(`<tr id="`+report.id+`"><td class="name"><a tabindex="0" onclick="openReport(`+report.id+`)">`+report.name+`</a></td><td><a href="`+report.report["url"]+`">`+report.report["url"]+`</a></td><td class="time">`+report.created+`</td><td><input type="button" value="Delete" onclick="deleteReport(`+report.id+`)"></td></tr>`);
	}

	table.append(tableBody);
	$("#middleOfPage").append(table);

});

function openReport(id) {
	let report = reportList.find(element => element.id === id);
	$("#reportInfo").empty();
	$("#reportInfo").append(`
		<h2>`+report.name+`</h2>
		<a href="`+report.report["url"]+`">`+report.report["url"]+`</a>
		<p>Created: `+report.created+`</p>
	`);
	tableView(report.report,"buttons");
	tableView(report.report,"images");
	tableView(report.report,"inputs");
	$(".reportControls").empty();
	$(".reportControls").append(`
		<input type="button" value="Delete" onclick="deleteReport(`+report.id+`)">
	`);
	addModalListeners("reportModal")
	displayModal();
}

function deleteReport(id) {
	displayModal();
}

//This function will create the table view for the report
function tableView(report,sectionType) {
	//Sets up variables
	let div = $("#"+sectionType+"Div")
	if(jQuery.isEmptyObject(report[sectionType].value)) {
		div.append("<p>No suggestions. Good job!</p>");
		return;
	}
	let table = $("<table>");
	let tableBody = $("<tbody>");

	//Clears div
	div.empty();

	//Sets up headings
	if(sectionType == "buttons") {
	table.append("<thead><tr><th>Type</th><th>Identifier</th><th>Suggested aria-label</th></tr></thead>");
	}
	else if(sectionType == "images") {
	table.append("<thead><tr><th>Image</th><th>Source</th><th>Alt Text</th></tr></thead>");
	}
	else if(sectionType == "inputs") {
		table.append("<thead><tr><th>Type</th><th>Identifier</th><th>Suggested Changes</th></tr></thead>");
	}

	//Loops through report and adds rows to table
	for(let key in report[sectionType].value) {
	tableBody.append(`<tr><td class="imgtd">`+report[sectionType].value[key][0]+`</td><td>`+report[sectionType].value[key][1]+`</td><td>`+report[sectionType].value[key][2]+`</td></tr>`);
	}

	//Appends tableBody
	table.append(tableBody);

	//Appends table
	div.append(table);

}

function displayModal() {
	$("#reportModal").css("display","block");
	$("#reportModalContent").focus();
}


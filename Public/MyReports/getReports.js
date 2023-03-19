
let reportList;
getReports()

function getReports() {
	$.get("/getReports").done(function(data) {
		reportList = data;
		let table = $("<table>");
		let tableBody = $("<tbody>");

		//Clears table body
		tableBody.empty();

		table.append("<thead><tr><th>Name</th><th>Page Link</h><th>Created</th><th>Action</th></tr></thead>");

		for(let report of reportList) {
			console.log(report);
			tableBody.append(`<tr id="`+report.id+`"><td class="name"><a tabindex="0" onclick="openReport(`+report.id+`)">`+report.name+`</a></td><td><a href="`+report.report["url"]+`">`+report.report["url"]+`</a></td><td class="time">`+new Date(report.created)+`</td><td><input type="button" value="Delete" onclick="confirmDeleteReport(`+report.id+`)"></td></tr>`);
		}

		table.append(tableBody);
		$("#reportTableDiv").empty();
		$("#reportTableDiv").append(table);

	});
}

function openReport(id) {
	let report = reportList.find(element => element.id === id);
	$("#reportInfo").empty();
	$("#reportInfo").append(`
		<h2>`+report.name+`</h2>
		<a href="`+report.report["url"]+`">`+report.report["url"]+`</a>
		<p>Created: `+new Date(report.created)+`</p>
	`);
	tableView(report.report,"buttons");
	tableView(report.report,"images");
	tableView(report.report,"inputs");
	$("#reportModal .modalControls").empty();
	$("#reportModal .modalControls").append(`
		<h2> Controls </h2>
		<input type="button" value="Delete" onclick="confirmDeleteReport(`+report.id+`,true)">
	`);
	addModalListeners("reportModal")
	displayModal("reportModal");
}

function confirmDeleteReport(id,reportOpen) {
	displayModal("confirmDeleteModal");
	addModalListeners("confirmDeleteModal");
	$("#confirmDeleteModal .modalControls").empty();
	$("#confirmDeleteModal .modalControls").append(`
		<input type="button" value="Cancel" onclick="cancelDelete(`+reportOpen+`)">
		<input type="button" value="Delete" onclick="deleteReport(`+id+`)">
	`);
}

function cancelDelete(reportOpen) {
	if(reportOpen) {
		displayModal("reportModal");
	}
	else {
		hideModal("confirmDeleteModal");
	}
}

function deleteReport(id) {
	$.ajax({url:"/deleteReport",type:"delete",data:{reportId:id},success:function() {
		hideModal("confirmDeleteModal");
		alert("Report Deleted")
		getReports();
	}});
}

//This function will create the table view for the report
function tableView(report,sectionType) {
	//Sets up variables
	let div = $("#"+sectionType+"Div")
	div.empty()
	if(jQuery.isEmptyObject(report[sectionType].value)) {
		div.append("<p>No suggestions. Good job!</p>");
		return;
	}
	let table = $("<table>");
	let tableBody = $("<tbody>");

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



let reportList;
let report;

getReports()

function getReports() {
	$.get("/getReports").done(function(data) {
		reportList = data;
		let table = $("<table>");
		let tableBody = $("<tbody>");

		//Clears table body
		tableBody.empty();

		table.append("<thead><tr><th>Name</th><th>Page Link</h><th>Created</th><th>Action</th></tr></thead>");

		for(let rep of reportList) {
			tableBody.append(`<tr id="`+rep.id+`"><td class="name"><a tabindex="0" onclick="openReport(`+rep.id+`)">`+rep.name+`</a></td><td><a href="`+rep.report["url"]+`">`+rep.report["url"]+`</a></td><td class="time">`+new Date(rep.created)+`</td><td><input type="button" value="Delete" onclick="confirmDeleteReport(`+rep.id+`)"></td></tr>`);
		}

		table.append(tableBody);
		$("#reportTableDiv").empty();
		$("#reportTableDiv").append(table);

	});
}

function openReport(id) {
	let reportDetails = reportList.find(element => element.id === id);
	report = reportDetails.report;
	$("#reportInfo").empty();
	$("#reportInfo").append(`
		<h2>`+reportDetails.name+`</h2>
		<a href="`+report["url"]+`">`+report["url"]+`</a>
		<p>Created: `+new Date(reportDetails.created)+`</p>
	`);
	tableView("buttons");
	tableView("images");
	tableView("inputs");
	$("#reportModal .modalControls").empty();
	$("#reportModal .modalControls").append(`
		<h2> Controls </h2>
		<input type="button" value="Delete" onclick="confirmDeleteReport(`+reportDetails.id+`,true)">
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

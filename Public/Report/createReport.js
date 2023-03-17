
let report;

//This waits until the page has loaded
if(document.readyState) {
	console.log("Creating report");
	//Sends request
	$.get("/createReport").done(addReport).fail(handleErrors);
}

//This will deal with any errors returned by the get request
function handleErrors(ex) {
	console.error("Failed to create report");
	console.error(ex);
}

//Handles the get request if it is a success
function addReport(data) {
	report = data;
	console.log("Report creation started");

	//This clears the middleOfPage div
	$("#middleOfPage").empty();

	$("#middleOfPage").append(`
		<h3> Your Report </h3>
		<p> Report generated for: <a href="`+report["url"]+`">`+report["url"]+`</a></p>
		<input id="saveReportBtn" type="button" value="Save" onclick="displayModal('saveModal')">
		<div id="saveModal" class="modal">
			<div id="saveModalContent" class="modalContent">
				<span id="saveModalClose" class="close" tabindex="0">&times;</span>
				<h3>Save This Report</h3>
				<form id="saveDetails">
					<label for="reportName">Report Name</label>
					<input id="reportName" type="text" value="`+report["url"]+`"></br></br>
					<input type="button" value="Save" onclick="saveReport()">
				</form>
			</div>
		</div>
		<details>
			<summary><h3>Buttons</h3></summary>
			<div id="buttonsDiv"></div>
		</details>
		<details>
			<summary><h3>Images</h3></summary>
			<div id="imagesDiv"></div>
		</details>
		<details>
			<summary><h3>Inputs</h3></summary>
			<div id="inputsDiv"></div>
		</details>
	`);

	addModalListeners("saveModal");

	tableView("buttons");
	tableView("images");
	tableView("inputs");
}

//This function will create the table view for the report
function tableView(sectionType) {
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

async function saveReport() {
	let body = {
		reportName:$("#reportName")[0].value,
		report:report
	};
	$.post("/saveReport",body).done(function() {
		console.log("Report Saved");
		alert("Your report was saved successfully");
	}).fail(function(ex) {
		console.error(ex);
	});
}
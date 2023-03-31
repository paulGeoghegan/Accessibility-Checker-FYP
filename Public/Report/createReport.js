
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
		<input id="saveReportBtn" type="button" disabled value="Save (Please login)" onclick="displayModal('saveModal')">
		<div id="saveModal" class="modal">
			<div id="saveModalContent" class="modalContent">
				<span id="saveModalClose" class="close" tabindex="0">&times;</span>
				<h3>Save This Report</h3>
				<form id="saveDetails">
					<label for="reportName">Report Name</label>
					<input id="reportName" type="text" value="`+report["url"]+`" required></br></br>
					<input type="button" value="Save" onclick="saveReport()">
				</form>
			</div>
		</div>
		<div id="reportInfo"></div>
	`);

	addModalListeners("saveModal");

	tableView("buttons");
	tableView("images");
	tableView("inputs");
	tableView("links");
	$.get("/isLoggedIn").done(function(authenticated) {
		if(authenticated) {
			$("#saveReportBtn").prop("disabled",	false).val("Save");
		}
	})
}

async function saveReport() {
	let body = {
		reportName:$("#reportName")[0].value,
		report:report
	};
	$.post("/saveReport",body).done(function() {
		console.log("Report Saved");
		alert("Your report was saved successfully");
		hideModal("saveModal");
		$("#saveReportBtn").prop("disabled",true);
	}).fail(function(ex) {
		console.error(ex);
	});
}
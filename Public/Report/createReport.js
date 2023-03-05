

//This waits till the page has loaded
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
function addReport(report) {
	console.log("Report creation started");

	//This clears the middleOfPage div
	$("#middleOfPage").empty();

	//This appends some text at the top of the report
	$("#middleOfPage").append(`
		<h3> Your Report </h3>
		<p> Report generated for: <a href="`+report["url"]+`">`+report["url"]+`</a></p>
		<details>
			<summary><h3>Buttons</h3></summary>
			<div id="buttonsDiv"></div>
		</details>
		<details>
			<summary><h3>Images</h3></summary>
			<div id="imagesDiv"></div>
		</details>
`);

	tableView(report,"buttons");
	tableView(report,"images");
}

//This function will create the table view for the report
function tableView(report,sectionType) {
	//Sets up variables
	let div = $("#"+sectionType+"Div")
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

	//Loops through report and adds rows to table
	for(let key in report[sectionType].value) {
	tableBody.append(`<tr><td class="imgtd">`+report[sectionType].value[key][0]+`</td><td>`+report[sectionType].value[key][1]+`</td><td>`+report[sectionType].value[key][2]+`</td></tr>`);
	}

	//Appends tableBody
	table.append(tableBody);

	//Appends table
	div.append(table);

}
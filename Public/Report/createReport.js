
const report = {};

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
	console.log(report);
	tableView("images");
}

//This function will create the table view for the report
function tableView(sectionType) {
	//Sets up variables
	let div = $("#"+sectionType+"Div")
	let table = $("<table>");

	//Clears div
	div.innerHTML="";

	//Sets up headings
	if(sectionType == "images") {
	table.append("<tr><th>Source</th><th>Alt Text</th></tr>");
	}

	//Loops through report and adds rows to table
	for(let img in report[sectionType]) {
		console.log(img);
	}

	//Appends table
	div.append(table);

}
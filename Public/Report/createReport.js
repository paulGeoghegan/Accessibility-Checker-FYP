
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
function addReport(results) {
	console.log("Report creation started");
	$("#middleOfPage").append(results);
}
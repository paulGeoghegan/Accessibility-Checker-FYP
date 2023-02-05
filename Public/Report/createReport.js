
//This waits till the page has loaded
if(document.readyState) {
	console.log("Creating report");
	createWebsiteReport();
}

//This sends the get request which will generate and retrieve the report
function createWebsiteReport() {
	//Sends request
	get = $.get("/createReport");
	//This will handle the get request after it finishes
	get.done(addReport);
	//This will handle any errors from the get request
	get.fail(handleErrors);
}


//This will deal with any errors returned by the get request
function handleErrors() {
	console.error("Failed to create report");
}


//Handles the get request if it is a success
function addReport() {
	console.log("Report creation started");
	results.appendTo('#middleOfPage');

}
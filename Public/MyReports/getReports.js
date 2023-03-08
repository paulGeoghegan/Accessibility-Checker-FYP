
$.get("/getReports").done(function(reportList) {
	let table = $("<table>");
	let tableBody = $("<tbody>");

	//Clears table body
	tableBody.empty();

	table.append("<thead><tr><th>Name</th><th>Created</th><th>Action</th></tr></thead>");

	for(let report of reportList) {
		tableBody.append(`<tr><td>`+report.name+`</td><td>`+report.created+`</td><td><input type="button" value="Delete"></td></tr>`);
	}

	table.append(tableBody);
	$("#middleOfPage").append(table);

});
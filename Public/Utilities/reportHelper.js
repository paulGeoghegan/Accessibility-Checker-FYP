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
	else if(sectionType == "links") {
	table.append("<thead><tr><th>Link</th><th>Identifier</th><th>Aria-label</th></tr></thead>");
	}

	//Loops through report and adds rows to table
	for(let key in report[sectionType].value) {
	tableBody.append(`<tr><td class="imgtd">`+report[sectionType].value[key][0]+`</td><td>`+report[sectionType].value[key][1]+`</td><td><div class="suggestionDiv">`+report[sectionType].value[key][2]+`</div></td></tr>`);
	}

	//Appends tableBody
	table.append(tableBody);

	//Appends table
	div.append(table);

}

//This function will create the table view for the report
function tableView(sectionType) {
	let table = $("<table>");
	let tableBody = $("<tbody>");
	let mainDiv = $("#reportInfo");

	//Sets up The sections for each part of the report
	if(sectionType == "buttons") {
		mainDiv.append(`
			<details>
				<summary><h3 id="buttonsHeading">Buttons</h3></summary>
				<p>Below is a list of buttons from the webpage that you entered that are currently not accessible. We have generated some suggestions to help you fix them.</p>
				<div id="buttonsDiv"></div>
			</details>
		`);
		table.append("<thead><tr><th>Type</th><th>Identifier</th><th>Suggested aria-label</th></tr></thead>");
	}
	else if(sectionType == "images") {
		mainDiv.append(`
			<details>
				<summary><h3 id="imagesHeading">Images</h3></summary>
				<p>Below is a list of images that don't have alt text from the webpage that you entered. We generated some alt text and tried to read the text in the images to speed things up for you.</p>
				<div id="imagesDiv"></div>
			</details>
		`);
	table.append("<thead><tr><th>Image</th><th>Source</th><th>Suggested Alt Text</th></tr></thead>");
	}
	else if(sectionType == "inputs") {
		mainDiv.append(`
			<details>
				<summary><h3 id="inputsHeading">Inputs</h3></summary>
				<p>Below is a list of inputs from the webpage that you entered that are currently not accessible. We have generated some suggestions to help you fix them.</p>
				<div id="inputsDiv"></div>
			</details>
		`);
		table.append("<thead><tr><th>Type</th><th>Identifier</th><th>Suggested Changes</th></tr></thead>");
	}
	else if(sectionType == "links") {
		mainDiv.append(`
			<details>
				<summary><h3 id="linksHeading">Links</h3></summary>
				<p>Below is a list of links that don't seem to have any text for a screenreader to read. We have come up with some suggestions to try and help you fix them.</p>
				<div id="linksDiv"></div>
			</details>
		`);
	table.append("<thead><tr><th>Link</th><th>Identifier</th><th>Suggested Aria-label</th></tr></thead>");
	}

	let div = $("#"+sectionType+"Div")

	if(!jQuery.isEmptyObject(report[sectionType].value)) {
		$("#"+sectionType+"Heading").append(`: <span class="issuesFound">`+Object.keys(report[sectionType].value).length+` issues</span>`);
	}
	else {
		$("#"+sectionType+"Heading").append(`: <span class="noIssues">0 issues</span>`);
		div.append("<p>No suggestions. Good job!</p>");
		return;
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

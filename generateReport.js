require("dotenv").config();
const ComputerVisionClient = require('@azure/cognitiveservices-computervision').ComputerVisionClient;
const ApiKeyCredentials = require('@azure/ms-rest-js').ApiKeyCredentials;
const cheerio = require("cheerio");
const axios = require("axios");

//Gets key and endpoint from .env file for computer vision
const microsoft_computer_vision_key = process.env.mskey;
const microsoft_computer_vision_endpoint = process.env.msendpoint;

//Creates client
const computerVisionClient = new ComputerVisionClient(new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': microsoft_computer_vision_key } }), microsoft_computer_vision_endpoint);

//Sets up functions that will be exported
module.exports={
	create:create
}


//This will be the main function that handles generating the report for the user
async function create(url) {

	//Defines report object
	let report = {images:{},buttons:{},inputs:{},"url":url};
	//This retrieves the html from the given URL
	const response = await axios.get(url);
	//This sets up the dom using cheerio
	const $ = cheerio.load(response.data);
	let imageList = $("img");
	let buttonList = $("button");
	let inputList = [$("input, textarea"),$("label")];

	//Calls async functions for report generation
	[report["images"],report["buttons"],report["inputs"]] = await Promise.allSettled([generateAltText(imageList,url),generateButtonText(buttonList),generateInputSuggestions(inputList)]);

	return report;

}

//This function handles sending the request to azure computer vision
async function generateAltText(imageList,url) {

	//This stores the features the user wants returned
	let features = ['ImageType', 'Faces', 'Adult', 'Categories', 'Color', 'Tags', 'Description', 'Objects', 'Brands'];
	let images = {};
	let altText;
	let imgSrc;

//Loops through the list of images
	for(let img of imageList) {
		if((!img.attribs["alt"]||img.attribs["alt"]==""||img.attribs["alt"]==" ")) {
			//This will check where the images src is located in the html
			if(!img.attribs["data-lazyload"] && !img.attribs["data-lazy-src"]) {
				imgSrc = img.attribs["src"];
			}
			else if(img.attribs["data-lazy-src"]) {
				imgSrc = img.attribs["data-lazy-src"];
			} else {
				imgSrc = img.attribs["data-lazyload"];
			}
			console.log("Checking URL",url);
			//This makes sure the url is valid
			if(imgSrc.startsWith("//")) {
				imgSrc = url.split("//")[0]+imgSrc;
			}
			else if(imgSrc.startsWith("/")) {
				imgSrc = url.split("/")[2]+imgSrc;
			}
			else if(!imgSrc.includes("://")) {
				console.log("Test");
				imgSrc = url+"/"+imgSrc;
			}

			console.log("Image URL:",imgSrc);
			altText = await computerVisionClient.analyzeImage(imgSrc,{visualFeatures: features});
			altText = altText.description["captions"][0].text;

			//Assigns to object
			images[imgSrc] = [`<img src="`+imgSrc+`" alt="`+altText+`" width="100%" height="100%">`,`<a href="`+imgSrc+`">`+imgSrc+`</a>`,altText];
		}
	}

	return images;
}

//This function will use the button id to generate suggested text for the button
async function generateButtonText(buttonList) {
	let buttons = {}
	for(let button of buttonList) {
		if((button.attribs["value"] == "" || !button.attribs["value"]) && (button.attribs["aria-label"] == "" || !button.attribs["aria-label"]) && (button.attribs["aria-labelledby"] == "" || !button.attribs["aria-labelledby"])) {
			let suggestion = generateText(button);
			inputs[Object.keys(suggestion)[0]] = suggestion[Object.keys(suggestion)[0]];
		}
	}
	return buttons;
}

//This will loop through the input elements and generate suggestions for each one
async function generateInputSuggestions(inputList) {
	let inputs = {};
	for(let input of inputList[0]) {

		if(input.attribs["type"] == "button" && (!input.attribs["value"] || input.attribs["value"] == "") && ((!input.attribs["aria-label"] || input.attribs["aria-label"] == "") || (input.attribs["aria-labelledby"] || input.attribs["aria-labelledby"] == ""))) {
			let suggestion = generateText(input);
			inputs[Object.keys(suggestion)[0]] = suggestion[Object.keys(suggestion)[0]];
		}
		if((input.attribs["type"] == "text" || input["name"] == "textarea") && ((!input.attribs["aria-label"] || input.attribs["aria-label"] == "") || (input.attribs["aria-labelledby"] || input.attribs["aria-labelledby"] == ""))) {
			if(!inputList[1].find(element => element.attribs["for"] === input.attribs["id"])["prevObject"].length > 0 || input.attribs["id"] == undefined) {
				let suggestion = generateText(input);
				inputs[Object.keys(suggestion)[0]] = suggestion[Object.keys(suggestion)[0]];
			}
			else {
				console.log("Has a label",input.attribs);
			}
		}
	}
	console.log(inputs);
	return inputs;
}

//This will take some text and try to use it to generate a suggested name for the element
function generateText(element) {
	let suggestion = {};
	if(element.attribs["id"]) {
		suggestion[element.attribs["id"]] = [element.attribs["type"]!=null ? element.attribs["type"]:element["name"],"ID: "+element.attribs["id"],element.attribs["id"]];
	}
	else if(element.attribs["name"]) {
		suggestion[element.attribs["name"]] = [element.attribs["type"]!=null ? element.attribs["type"]:element["name"],"Name: "+element.attribs["name"],element.attribs["name"]];
	}
	else if(element.attribs["title"]) {
		suggestion[element.attribs["title"]] = [element.attribs["type"]!=null ? element.attribs["type"]:element["name"],"Title: "+element.attribs["title"],element.attribs["title"]];
	}
	else if(element.attribs["class"]) {
		suggestion[element.attribs["class"]] = [element.attribs["type"]!=null ? element.attribs["type"]:element["name"],"Class: "+element.attribs["class"],element.attribs["class"]];
	}
	else {
		console.log("Couldn't label:",element);
		return;
	}
	console.log(suggestion[Object.keys(suggestion)[0]]);
	suggestion[Object.keys(suggestion)[0]][2] = suggestion[Object.keys(suggestion)[0]][2].split(/(?=[A-Z])|-|_/).join(" ");
	return suggestion;
}

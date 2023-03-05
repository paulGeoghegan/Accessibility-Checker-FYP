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
	let inputList = $("input");

	//Calls async functions for report generation
	[report["images"],report["buttons"],report["inputs"]] = await Promise.allSettled([generateAltText(imageList),generateButtonText(buttonList),generateInputSuggestions(inputList)]);

	return report;

}

//This function handles sending the request to azure computer vision
async function generateAltText(imageList) {

	//This stores the features the user wants returned
	let features = ['ImageType', 'Faces', 'Adult', 'Categories', 'Color', 'Tags', 'Description', 'Objects', 'Brands'];
	let images = {};
	let altText;
	let imgSrc;

//Loops through the list of images
	for(let img of imageList) {
		if(img.name == "img" && img.attribs["width"] >= 50 && img.attribs["height"] >= 50 && (!img.attribs["alt"]||img.attribs["alt"]==""||img.attribs["alt"]==" ")) {
			//This will check where the images src is located in the html
			if(!img.attribs["data-lazyload"] && !img.attribs["data-lazy-src"]) {
				altText = await computerVisionClient.analyzeImage(img.attribs["src"],{visualFeatures: features});
				altText = altText.description["captions"][0].text;
				imgSrc = img.attribs["src"];
			}
			else if(img.attribs["data-lazy-src"]) {
				altText = await computerVisionClient.analyzeImage(img.attribs["data-lazy-src"],{visualFeatures: features});
				altText = altText.description["captions"][0].text;
				imgSrc = img.attribs["data-lazy-src"];
			} else {
				altText = await computerVisionClient.analyzeImage("https:"+img.attribs["data-lazyload"],{visualFeatures: features});
				altText = altText.description["captions"][0].text;
				imgSrc = "https:"+img.attribs["data-lazyload"];
			}
			//Assignes to object
			images[imgSrc] = [`<img src="`+imgSrc+`" alt="`+altText+`" width="100%" height="100%">`,`<a href="`+imgSrc+`">`+imgSrc+`</a>`,altText]
		}
	}

	return images;
}

//This function will use the button id to generate suggested text for the button
async function generateButtonText(buttonList) {
	let buttons = {}
	for(let button of buttonList) {
		if((button.attribs["value"] == "" || !button.attribs["value"]) && (button.attribs["aria-label"] == "" || !button.attribs["aria-label"]) && (button.attribs["aria-labelledby"] == "" || !button.attribs["aria-labelledby"])) {
			if(button.attribs["id"] != "") {
				buttons[button.attribs["id"]] = [button.type,"ID: "+button.attribs["id"],generateText(button.attribs["id"])];
			}
			else if(button.attribs["name"] != "") {
				buttons[button.attribs["name"]] = [button.type,"Name: "+button.attribs["name"],generateText(button.attribs["name"])];
			}
			else if(button.attribs["class"]) {
			buttons[button.attribs["class"]] = [button.type,"Class: "+button.attribs["class"],generateText(button.attribs["class"])];
			}
			else {
				console.log("Couldn't label:",button.attribs);
			}
		}
	}
	return buttons;
}

//This will loop through the input elements and generate suggestions for each one
function generateInputSuggestions(inputList) {
	let inputs = {};
	for(let input of inputList) {
		if(input.attribs["type"] == "button" && (!input.attribs["value"] || input.attribs["value"] == "") && ((!input.attribs["aria-label"] || input.attribs["aria-label"] == "") || (input.attribs["aria-labelledby"] || input.attribs["aria-labelledby"] == ""))) {
			console.log("input:",input.attribs);
		}
	}
	return inputs;
}

//This will take some text and try to use it to generate a suggested name for the element
function generateText(text) {
	console.log(text);
	let newText = text.split(/(?=[A-Z])|-|_/);
	return newText.join(" ");
}
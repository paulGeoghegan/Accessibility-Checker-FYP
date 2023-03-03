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
	create:create,
	generateAltText:generateAltText
}


//This will be the main function that handles generating the report for the user
async function create(url) {

	//Defines report object
	let report = {images:{},buttons:{},"url":url};
	//This retrieves the html from the given URL
	const response = await axios.get(url);
	//This sets up the dom using cheerio
	const $ = cheerio.load(response.data);
	let imageList = $("img");
	let buttonList = $("button");

	//Calls async functions for report generation
	[report["images"],report["buttons"]] = await Promise.allSettled([generateAltText(imageList),generateButtonText(buttonList)]);

	return report;

}

//This function handles sending the request to azure computer vision
async function generateAltText(imageList) {

	//This stores the features the user wants returned
	let features = ['ImageType', 'Faces', 'Adult', 'Categories', 'Color', 'Tags', 'Description', 'Objects', 'Brands'];
	let images = {};

//Loops through the list of images
	for(let img of imageList) {
		if(img.name == "img" && img.attribs["width"] >= 50 && img.attribs["height"] >= 50 && (!img.attribs["alt"]||img.attribs["alt"]==""||img.attribs["alt"]==" ")) {
			//This will check where the images src is located in the html
			if(!img.attribs["data-lazyload"] && !img.attribs["data-lazy-src"]) {
				images[img.attribs["src"]] = await computerVisionClient.analyzeImage(img.attribs["src"],{visualFeatures: features});
				images[img.attribs["src"]] = images[img.attribs["src"]].description["captions"][0].text;
			}
			else if(img.attribs["data-lazy-src"]) {
				images[img.attribs["data-lazy-src"]] = await computerVisionClient.analyzeImage(img.attribs["data-lazy-src"],{visualFeatures: features});
				images[img.attribs["data-lazy-src"]] = images[img.attribs["data-lazy-src"]].description["captions"][0].text;
			} else {
				images["https:"+img.attribs["data-lazyload"]] = await computerVisionClient.analyzeImage("https:"+img.attribs["data-lazyload"],{visualFeatures: features});
			images["https:"+img.attribs["data-lazyload"]] = images["https:"+img.attribs["data-lazyload"]].description["captions"][0].text;
			}
		}
	}

	return images;
}


//This function will use the button id to generate sugested text for the button
async function generateButtonText(buttonList) {
	for(let button of buttonList) {
		if(button.name == "button" || button.type == "button") {
			console.log("Button here!",button);
		}
		else {
			console.log("Not a button");
		}
	}
	return buttonList;
}
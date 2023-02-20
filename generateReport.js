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

	console.log("Starting");
	const report = {};
	//This retrieves the html from the given URL
	const response = await axios.get(url);
	//This sets up the dom using cheerio
	const $ = cheerio.load(response.data);
	console.log("image List");
	let imageList = $("img");
	console.log(imageList[0].name,imageList[0].attribs["src"],imageList[0].attribs["alt"]);

	//Loops through list and checks if they have alt text
	for(let img of imageList) {
		if(!img.attribs["alt"]||img.attribs["alt"]==""||img.attribs["alt"]==" ") {

		}
	}
	//report["images"] = await generateAltText(url);
	console.log(report);

	return report;

}

//This function handles sending the request to azure computer vision
async function generateAltText(image) {

	//This stores the features the user wants returned
	let features = ['ImageType', 'Faces', 'Adult', 'Categories', 'Color', 'Tags', 'Description', 'Objects', 'Brands'];

	//Gets results
	let results = await computerVisionClient.analyzeImage(image,{visualFeatures: features});
	console.log("Results:");
	console.log(results.description["captions"][0].text);

	return results.description["captions"][0].text;
}

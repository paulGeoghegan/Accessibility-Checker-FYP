require("dotenv").config();
const ComputerVisionClient = require('@azure/cognitiveservices-computervision').ComputerVisionClient;
const ApiKeyCredentials = require('@azure/ms-rest-js').ApiKeyCredentials;
const cheerio = require("cheerio");
const axios = require("axios");
const sleep=require('util').promisify(setTimeout);

const microsoft_computer_vision_key = process.env.mskey;
const microsoft_computer_vision_endpoint = process.env.msendpoint;

const computerVisionClient = new ComputerVisionClient(new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': microsoft_computer_vision_key } }), microsoft_computer_vision_endpoint);

module.exports={
	create:create
}

async function create(url) {

	let report = {images:{},buttons:{},inputs:{},"url":url};
	const response = await axios.get(url);
	const $ = cheerio.load(response.data);
	let imageList = $("img");
	let buttonList = $("button");
	let inputList = [$("input, textarea"),$("label")];

	[report["images"],report["buttons"],report["inputs"]] = await Promise.allSettled([generateAltText(imageList,url),generateButtonText(buttonList),generateInputSuggestions(inputList)]);

	return report;

}

async function generateAltText(imageList,url) {

	let features = ['Description','OCR'];
	let images = {};
	let altText;
	let imgSrc;

	for(let img of imageList) {
		if((!img.attribs["alt"]||img.attribs["alt"]==""||img.attribs["alt"]==" ")) {
			if(!img.attribs["data-lazyload"] && !img.attribs["data-lazy-src"]) {
				imgSrc = img.attribs["src"];
			}
			else if(img.attribs["data-lazy-src"]) {
				imgSrc = img.attribs["data-lazy-src"];
			} else {
				imgSrc = img.attribs["data-lazyload"];
			}
			if(imgSrc.startsWith("//")) {
				imgSrc = url.split("//")[0]+imgSrc;
			}
			else if(imgSrc.startsWith("/")) {
				imgSrc = url.split("/",3).join("/")+imgSrc;
			}
			else if(!imgSrc.includes("://")) {
				imgSrc = url+"/"+imgSrc;
			}
			altText = await computerVisionClient.describeImage(imgSrc);

			if(altText["tags"].includes("text")) {
				let ocrText="";
				let locationResponse = await computerVisionClient.read(imgSrc).then(function(response) {return response.operationLocation});
				let responseId = locationResponse.substring(locationResponse.lastIndexOf("/")+1);
				while(true) {
					let text = await computerVisionClient.getReadResult(responseId).then(function(response) {return response});
					if(text.status=="succeeded") {
						for(let page of text.analyzeResult.readResults) {
							for(let line of page.lines) {
								ocrText+=line.text+" ";
							}
						}
						break;
					}
					else if(text.status=="failed") {
						break;
					}
					await sleep(500);
				}
				altText = altText.captions[0].text+" that says:"+ocrText;
			}
			else {
				altText = altText.captions[0].text;
			}

			images[imgSrc] = [`<img src="`+imgSrc+`" alt="`+altText+`" width="100%" height="100%">`,`<a href="`+imgSrc+`">`+imgSrc+`</a>`,altText];
		}
	}

	return images;
}

async function generateButtonText(buttonList) {
	let buttons = {}
	for(let button of buttonList) {
		if((button.attribs["value"] == "" || !button.attribs["value"]) && (button.attribs["aria-label"] == "" || !button.attribs["aria-label"]) && (button.attribs["aria-labelledby"] == "" || !button.attribs["aria-labelledby"])) {
			let suggestion = generateText(button);
			buttons[Object.keys(suggestion)[0]] = suggestion[Object.keys(suggestion)[0]];
			buttons[Object.keys(suggestion)[0]][2] = `aria-label="`+suggestion[Object.keys(suggestion)[0]][2]+`"`;
		}
	}
	return buttons;
}

async function generateInputSuggestions(inputList) {
	let inputs = {};
	for(let input of inputList[0]) {
		if(input.attribs["type"] == "button" && (!input.attribs["value"] || input.attribs["value"] == "" || input.attribs["type"] == "radio") && ((!input.attribs["aria-label"] || input.attribs["aria-label"] == "") || (input.attribs["aria-labelledby"] || input.attribs["aria-labelledby"] == ""))) {
			let suggestion = generateText(input);
			inputs[Object.keys(suggestion)[0]] = suggestion[Object.keys(suggestion)[0]];
			inputs[Object.keys(suggestion)[0]][2] = `aria-label="`+inputs[Object.keys(suggestion)[0]][2]+`"`;
		}
		if((input.attribs["type"] == "text" || input["name"] == "textarea" || input.attribs["type"] == "checkbox" || input.attribs["type"] == "radio") && ((!input.attribs["aria-label"] || input.attribs["aria-label"] == "") || (input.attribs["aria-labelledby"] || input.attribs["aria-labelledby"] == ""))) {
			if(!inputList[1].find(element => element.attribs["for"] === input.attribs["id"])["prevObject"].length > 0 || input.attribs["id"] == undefined) {
				let suggestion = generateText(input);
				inputs[Object.keys(suggestion)[0]] = suggestion[Object.keys(suggestion)[0]];
				inputs[Object.keys(suggestion)[0]][2]=`&lt;label for="`+Object.keys(suggestion)[0]+`"&gt;`+inputs[Object.keys(suggestion)[0]][2]+`&lt;/label&gt;`;
			}
		}
	}
	return inputs;
}

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
		suggestion[element.attribs["type"]!=null ? element.attribs["type"]:element["name"]] = [element.attribs["type"]!=null ? element.attribs["type"]:element["name"],"No identifier found!","This means that there is at least one element of this type on your page that has no identifires that this website could find. Please add an id, name, class or title to every element if you want suggestions for them."];
		return suggestion;
	}
	suggestion[Object.keys(suggestion)[0]][2] = suggestion[Object.keys(suggestion)[0]][2].split(/(?=[A-Z])|-|_/).join(" ");
	suggestion[Object.keys(suggestion)[0]][2] = (suggestion[Object.keys(suggestion)[0]][2].charAt(0).toUpperCase()+suggestion[Object.keys(suggestion)[0]][2].slice(1)).replace(/\s+/g," ").trim();
	return suggestion;
}

require("dotenv").config();
const ComputerVisionClient = require('@azure/cognitiveservices-computervision').ComputerVisionClient;
const ApiKeyCredentials = require('@azure/ms-rest-js').ApiKeyCredentials;
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const { response } = require("express");


//Gets key and endpoint from .env file for computer vision
const microsoft_computer_vision_key = process.env.mskey;
const microsoft_computer_vision_endpoint = process.env.msendpoint;

//Creates client
const computerVisionClient = new ComputerVisionClient(new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': microsoft_computer_vision_key } }), microsoft_computer_vision_endpoint);

//Sets up express server
const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + "/Public"));
app.use(cookieParser());
app.use(session({
	secret: process.env.appsecret,
	saveUninitialized: true,
	resave: true
}));

app.listen(3000, function() {
	console.log('Server running on port 3000');
});


//This serves the user the Home page
app.get("/", function(req, res) {
	res.sendFile(__dirname + "/Public/Home/home.html");
});

//This handles the post request for when the user enters a URL
app.post("/", async function(req, res) {

	console.log("Getting Alt Text");
	//This stores the URL for the image the user wants described
	image = req.body.userImageURL;
	console.log(image)

	//This gets the alt text back from the microsoft computer vision service
	req.session.results = await generateAltText(image)
	console.log(req.session.results[0].text);
	res.redirect("/report");

});

//This serves the user the report page
app.get("/report", function(req, res) {
	res.sendFile(__dirname + "/Public/Report/report.html");
});



//This function handles sending the request to azure computer vision
async function generateAltText(image) {

	//This stores the features the user wants returned
	features = ['ImageType', 'Faces', 'Adult', 'Categories', 'Color', 'Tags', 'Description', 'Objects', 'Brands'];
	domainDetails = ['Celebrities', 'Landmarks'];

	//Gets results
	const results = (await computerVisionClient.analyzeImage(image,{visualFeatures: features},{details: domainDetails}));
	console.log("Results:");
	console.log(results.description["captions"]);

	return results.description["captions"];
}

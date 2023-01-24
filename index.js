require("dotenv").config();
const ComputerVisionClient = require('@azure/cognitiveservices-computervision').ComputerVisionClient;
const ApiKeyCredentials = require('@azure/ms-rest-js').ApiKeyCredentials;
const express = require("express");
const bodyParser = require("body-parser");

//Gets key from .env file
const microsoft_computer_vision_key = process.env.mskey;
const microsoft_computer_vision_endpoint = process.env.msendpoint;

//Creates client
const computerVisionClient = new ComputerVisionClient(new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': microsoft_computer_vision_key } }), microsoft_computer_vision_endpoint);

//Sets up express server
const app = express();
app.use(bodyParser.urlencoded({
    extended:true
}));
app.listen(3000, function() {
	console.log('Server running on port 3000');
});

app.get("/", function(req, res) {
	res.sendfile("./home.html");
});

app.post("/", function(req, res) {

	console.log("Getting Alt Text");
	image = req.body.userImage;

	const results = 

		const labels = results[0].labelAnnotations;

		console.log("Labels:");
		labels.forEach((label) => labelList+=","+label.description);
		console.log(labelList);
		res.send(labelList);
	});

});

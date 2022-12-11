require("dotenv").config();
const gv = require("@google-cloud/vision");
const express = require("express");

//Gets key from .env file
const google_vision_key=process.env.gvkey;

//Creates client
const gv_client = new gv.ImageAnnotatorClient(google_vision_key);

//Sets up express server
const app = express(

);

app.listen(3000, function() {
	console.log('Server running on port 3000');
});

app.get("/", function(req, res) {
	res.sendfile("./home.html");
});

app.post("/getAltText", function(req, res) {

	//Gets description for image
	gv_client.labelDetection("./test.jpg").then((results) => {
		const labels = results[0].labelAnnotations;

		console.log("Labels:");
		labels.forEach((label) => console.log(label.description));
	});

});
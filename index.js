require("dotenv").config();
const gv = require("@google-cloud/vision");
const express = require("express");
const bodyParser = require("body-parser");

//Gets key from .env file
const google_vision_key=process.env.gvkey;

//Creates client
const gv_client = new gv.ImageAnnotatorClient(google_vision_key);

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
	labelList = "";

	//Gets description for image
	gv_client.labelDetection(image).then((results) => {
		const labels = results[0].labelAnnotations;

		console.log("Labels:");
		labels.forEach((label) => labelList+=","+label.description);
		console.log(labelList);
		res.send(labelList);
	});

});

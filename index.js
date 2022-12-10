require("dotenv").config();
const gv = require("@google-cloud/vision");

//Gets key from .env file
const google_vision_key=process.env.gvkey;

//Creates client
const gv_client = new gv.ImageAnnotatorClient(google_vision_key);

//Gets description for image
gv_client.labelDetection("./test.jpg").then((results) => {
	const labels = results[0].labelAnnotations;

	console.log("Labels:");
	labels.forEach((label) => console.log(label.description));
});

require("dotenv").config();
const ComputerVisionClient = require('@azure/cognitiveservices-computervision').ComputerVisionClient;
const ApiKeyCredentials = require('@azure/ms-rest-js').ApiKeyCredentials;
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const { response } = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const db = require("./dbManager.js")


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

app.use(passport.initialize());
app.use(passport.session());

//Uses pasport to authenticate user
passport.use(new LocalStrategy(function checkUser(email, password,done) {
	console.log("Logging in ",email);
	//This sends the query to the db
	db.findUser(email).then(function(row) {
		if(!row) {
			return done(null,false,"Sorry that user doesn't exist");
		}
		else {
			//This compairs the passwords
			bcrypt.compare(password,row.password,function(ex,result) {
				//Checks if they match
				if(result == true) {
					//Sets up user
					done(null,row.id);
				}
				else {
					return done(ex,false,"Incorrect password");
				}
			})
		}
	}).catch(function(ex) {
		console.error(ex);
		return done(ex,false);
});
}));

passport.serializeUser(function(user,done) {
	console.log(user,done);
	done(null,user.id);
});

//This will find an deserialize the user
passport.deserializeUser(function(id,done) {
	db.deserializeUser(id).then(function(row) {
		console.log("User found id is:",row.id);
		done(null,row.id)
	}).catch(function(ex) {
		console.error(ex);
	})
});

app.listen(3000, function() {
	console.log('Server running on port 3000');
});


//This serves the user the Home page
app.get("/", function(req, res) {
	res.sendFile(__dirname + "/Public/Home/home.html");
});

//This handles the post request for when the user enters a URL
app.post("/", function(req, res) {
	console.log("Getting Alt Text");
	//This stores the URL for the image the user wants described
	req.session.imageURL = req.body.userImageURL;
	console.log(req.session.imageURL)
	//Redirects to the Report page
	res.redirect("/report");
});

//This serves the user the Create Account page
app.get("/createAccount", function(req, res) {
	res.sendFile(__dirname + "/Public/Create Account/createAccount.html");
});

//This creates the users account or lets them know if it doesn't exist
app.post("/createAccount", function(req, res) {

	//Gets email and password
	const email = req.body.email;
	const password = req.body.password;

	//This will hash the users password
	bcrypt.hash(password,10,function(ex,hashedPassword) {
		//Logs error if there is any
		if(ex != null) {
			console.log(ex);
		}

		//Adds new user to the database
		db.addUser(email,hashedPassword).then(function() {
			console.log("New user added");
			res.status(204).send("user added");
		}).catch(function(ex) {
			console.error(ex);
			res.status(403).send(ex);
		});
	});
});

//This checks if the user is logged in or not
app.get("/isLoggedIn", function(req, res) {
	if(req.isAuthenticated()) {
		link = '<a href="/account">Account</a>'
		res.status(200).send(link);
	}
	else {
		link = '<a href="/createAccount">Create Account</a>\t<a href="/logIn">Log In</a>'
		res.status(200).send(link);
	}
});

//This serves the log in page
app.get("/logIn", function(req,res) {
	res.sendFile(__dirname + "/public/Log In/login.html");
});

//This route will handle logging the user in
app.post("/logIn", function(req,res) {
	console.log("Logging user in");
	passport.authenticate("local",function(ex,user,info) {
		if(ex) {
			console.error(ex);
			res.status(403).send(ex);
		}
		else if(!user) {
			console.log(info);
			res.status(400).send(info);
		}
		else {
			req.logIn(user,function(ex) {
				if(ex) {
					console.error(ex);
					res.status(400).send(ex);
				}
				else {
					console.log("User now authenticated");
					res.status(200).send("Success");
				}
			})
		}
	});
});

//This serves the user the My Reports page
app.get("/myReports", function(req, res) {
	res.sendFile(__dirname + "/Public/My Reports/myReports.html");
});

//This serves the user the report page
app.get("/report", function(req, res) {
	console.log("User Redirected");
	res.sendFile(__dirname + "/Public/Report/report.html");
});

//This root will generate and send the website report
app.get("/createReport", async function(req, res) {
	console.log(req.session.imageURL);
	try {
		results = await generateAltText(req.session.imageURL);
		res.status(200).send(results);
	}
	catch (ex) {
		console.error(ex);
		res.status(400).send(ex);
	}
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

//This function checks if the user is logged in
function loggedIn() {
	return function(req, res, next) {
		if(req.isAuthenticated()) {
			return next();
		}
		res.redirect("/logIn");
	}
}
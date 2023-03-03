require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const { response } = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const db = require("./dbManager.js")
const generateReport = require("./generateReport.js");


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
passport.use(new LocalStrategy({usernameField:'email', passwordField:'password'}, function(email, password,done) {
	console.log("Logging in ",email);
	//This sends the query to the db
	db.findUser(email).then(function(row) {
		if(!row) {
			return done(null,false,"Sorry that user doesn't exist");
		}
		else {
			//This compairs the passwords
			bcrypt.compare(password,row.password,function(ex,result) {
				if(result) {
					//Sets up user
					done(null,row.id);
				}
				else {
					return done(null,false,"Incorrect password");
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
	done(null,user);
});

//This will find an deserialize the user
passport.deserializeUser(function(user,done) {
	db.deserializeUser(user).then(function(row) {
		done(null,row.email);
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
	console.log("Getting Website URL");
	//This stores the URL of the website for the report the user wants generated
	req.session.websiteURL = req.body.userURL;
	console.log(req.session.websiteURL)
	//Redirects to the Report page
	res.redirect("/report");
});

//This serves the account page
app.get("/account", loggedIn, function(req,res) {
	res.sendFile(__dirname+"/Public/Account/account.html");
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

//This gets the users email to be displayed on the account page
app.get("/getUserEmail", function(req,res) {
	console.log(req.user);
	res.send(req.user);
});

//This checks if the user is logged in or not
app.get("/isLoggedIn", function(req, res) {
	if(req.isAuthenticated()) {
		let link = '<a href="/account">Account</a>'
		res.status(200).send(link);
	}
	else {
		let link = '<a href="/createAccount">Create Account</a>\t<a href="/logIn">Log In</a>'
		res.status(200).send(link);
	}
});

//This serves the log in page
app.get("/logIn", function(req,res) {
	res.sendFile(__dirname + "/Public/Log In/login.html");
});

//This route will handle logging the user in
app.post("/logIn", passport.authenticate("local", {
	successRedirect:"/",
	failureRedirect:"/logIn"
}) );

//This will handle logging the user out
app.delete("/logOut", function(req,res) {
	console.log("Logging user out");
	req.logOut(function(ex) {
		if(ex) {
			console.log(ex);
		}
		else {
			console.log("Redirecting");
		}
	});
});

//This serves the user the My Reports page
app.get("/myReports", loggedIn, function(req, res) {
	res.sendFile(__dirname + "/Public/My Reports/myReports.html");
});

//This serves the user the report page
app.get("/report", function(req, res) {
	console.log("User Redirected");
	res.sendFile(__dirname + "/Public/Report/report.html");
});

//This root will generate and send the website report
app.get("/createReport", async function(req, res) {
	console.log(req.session.websiteURL);

	//This will generate the report for the user
	let report = await generateReport.create(req.session.websiteURL);

	res.status(200).send(report);

});

//This function checks if the user is logged in
function loggedIn(req,res,next) {
	if(req.isAuthenticated()) {
		return next();
	}
	else {
		res.redirect("/logIn");
	}
}
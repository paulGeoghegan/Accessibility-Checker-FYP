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
	done(null,user);
});

//This will find an deserialize the user
passport.deserializeUser(function(user,done) {
	db.deserializeUser(user).then(function(row) {
		done(null,{"id":row.id,"email":row.email});
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
	req.session.websiteURL = req.body.userURL;
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
			console.error(ex);
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

app.delete("/deleteReport",function(req,res) {
	db.deleteReport(req.body.reportId).then(function() {
		res.status(200).send("Deleted");
	}).catch(function(ex) {
		console.error(ex);
	})
});

app.get("/getReports",async function(req,res) {
	db.getAllReports(req.user.id).then(function(reportList) {
		res.status(200).send(reportList);
	}).catch(function(ex) {
		console.error(ex);
		res.send(ex);
	});
});

//This gets the users email to be displayed on the account page
app.get("/getUserEmail", function(req,res) {
	res.send(req.user.email);
});

//This checks if the user is logged in or not
app.get("/isLoggedIn", function(req, res) {
	if(req.isAuthenticated()) {
		res.status(200).send(true);
	}
	else {
		res.status(200).send(false);
	}
});

app.get("/Learning",function(req,res) {
	res.sendFile(__dirname+"/Public/Learning/learning.html");
});

app.get("/exampleBadPage",function(req,res) {
	res.sendFile(__dirname+"/Public/Learning/Examples/badPage.html")
});

app.get("/logIn", function(req,res) {
	res.sendFile(__dirname + "/Public/Log In/login.html");
});

//This route will handle logging the user in
app.post("/logIn", passport.authenticate("local",
	{
		successReturnToOrRedirect:"/",
		failureRedirect:"/logIn",
		failureFlash:true,
		keepSessionInfo:true
	}
));

app.delete("/logOut", function(req,res) {
	req.logOut(function(ex) {
		if(ex) {
			console.error(ex);
		}
	});
});

//This serves the user the My Reports page
app.get("/myReports", loggedIn, function(req, res) {
	res.sendFile(__dirname+"/Public/MyReports/myReports.html");
});

app.get("/report", function(req, res) {
	res.sendFile(__dirname + "/Public/Report/report.html");
});

//This root will generate and send the website report
app.get("/createReport", async function(req, res) {

	//This will generate the report for the user
	let report = await generateReport.create(req.session.websiteURL);

	res.status(200).send(report);

});

app.post("/saveReport",function(req,res) {
		db.addReport(req.user.id,req.body.reportName,JSON.stringify(req.body.report)).then(function() {
			res.status(204).send("report added");
		}).catch(function(ex) {
			console.error(ex);
			res.status(403).send(ex);
		});
});

//This function checks if the user is logged in
function loggedIn(req,res,next) {
	if(req.isAuthenticated()) {
		return next();
	}
	else {
		req.session.returnTo=req.route.path;
		res.redirect("/logIn");
	}
}
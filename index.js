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

passport.use(new LocalStrategy({usernameField:'email', passwordField:'password'}, function(email, password,done) {
	db.findUser(email).then(function(row) {
		if(!row) {
			return done(null,false,"Sorry that user doesn't exist");
		}
		else {
			bcrypt.compare(password,row.password,function(ex,result) {
				if(result) {
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

passport.deserializeUser(function(user,done) {
	db.deserializeUser(user).then(function(row) {
		done(null,{"id":row.id,"email":row.email});
	}).catch(function(ex) {
		console.error(ex);
	})
});

let port = normalizePort(process.env.PORT || '3000');

function normalizePort(val) {
	let port = parseInt(val, 10);

	if(isNaN(port)) {
		return val;
	}

	if (port >= 0) {
		return port;
	}

	return false;
}

app.listen(port, function() {
	console.log('Server running on port ',port);
});


app.get("/", function(req, res) {
	res.sendFile(__dirname + "/Public/Home/home.html");
});

app.post("/", function(req, res) {
	req.session.websiteURL = req.body.userURL;
	res.redirect("/report");
});

app.get("/account", loggedIn, function(req,res) {
	res.sendFile(__dirname+"/Public/Account/account.html");
});

app.get("/createAccount", function(req, res) {
	res.sendFile(__dirname + "/Public/Create Account/createAccount.html");
});

app.post("/createAccount", function(req, res) {

	const email = req.body.email;
	const password = req.body.password;

	bcrypt.hash(password,10,function(ex,hashedPassword) {
		if(ex != null) {
			console.error(ex);
		}

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

app.get("/getUserEmail", function(req,res) {
	res.send(req.user.email);
});

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

app.get("/myReports", loggedIn, function(req, res) {
	res.sendFile(__dirname+"/Public/MyReports/myReports.html");
});

app.get("/report", function(req, res) {
	res.sendFile(__dirname + "/Public/Report/report.html");
});

app.get("/createReport", async function(req, res) {

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

function loggedIn(req,res,next) {
	if(req.isAuthenticated()) {
		return next();
	}
	else {
		req.session.returnTo=req.route.path;
		res.redirect("/logIn");
	}
}
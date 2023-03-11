require("dotenv").config();
const pgp = require('pg-promise')();
const { find } = require("async");
const { PreparedStatement: PS } = require('pg-promise');
//This sets up the connection with the db
const dbCon = pgp(`postgres://${process.env.pgUsername}:${process.env.pgPassword}@localhost:5432/${process.env.pgDBName}`);


module.exports={
	addReport:addReport,
	addUser:addUser,
	deserializeUser:deserializeUser,
	findUser:findUser,
	getAllReports:getAllReports
};

function addReport(userId, name, report) {
	const insertNewReport = new PS({
		name: "insertReport",
		text: "INSERT INTO reports (userId, name, report) VALUES ($1, $2, $3);",
		values: [userId, name, report],
	});

	return dbCon.none(insertNewReport);
}

function addUser(email, password) {
	const insertNewUser = new PS({
		name: "insertUser",
		text: "INSERT INTO users (email, password) VALUES ($1, $2);",
		values: [email, password],
	});

	return dbCon.none(insertNewUser);
}

function deserializeUser(id) {
	const deserializeExistingUser = new PS({
		name: "deserializeUser",
		text: "SELECT id, email FROM users WHERE id = $1;",
		values: [id],
	});

	return dbCon.one(deserializeExistingUser);
}

function findUser(email) {
	const findExistingUser = new PS({
		name: "findUser",
		text: "SELECT id, email, password FROM users WHERE email = $1;",
		values: [email],
	});

	return dbCon.one(findExistingUser);
}

function getAllReports(id) {
	const getReports = new PS({
		name: "getReports",
		text: "SELECT id, name, created, report FROM reports WHERE userId = $1;",
		values: [id],
	});

	return dbCon.any(getReports);
}

require("dotenv").config();
const pgp = require('pg-promise')();
const { find } = require("async");
const { PreparedStatement: PS } = require('pg-promise');
//This sets up the connection with the db
const dbCon = pgp(`postgres://${process.env.pgUsername}:${process.env.pgPassword}@localhost:5432/${process.env.pgDBName}`);


//Sets up db commands
module.exports={
	addUser:addUser,
	deserializeUser:deserializeUser,
	findUser:findUser
};

//Function for adding a user
function addUser(email, password) {
	//Creates prepared statement
	const insertNewUser = new PS({
		name: "insertUser",
		text: "INSERT INTO users (email, password) VALUES ($1, $2);",
		values: [email, password],
	});

	//Executes prepared statement
	return dbCon.none(insertNewUser);
}

//Function for finding a user
function findUser(email) {
	//Creates prepared statement
	const findExistingUser = new PS({
		name: "findUser",
		text: "SELECT id, email, password FROM users WHERE email = $1;",
		values: [email],
	});

	//Executes prepared statement
	return dbCon.one(findExistingUser);
}

//Function for deserializing a user
function deserializeUser(id) {
	//Creates prepared statement
	const deserializeExistingUser = new PS({
		name: "deserializeUser",
		text: "SELECT id FROM users WHERE id = $1;",
		values: [id],
	});

	//Executes prepared statement
	return dbCon.one(deserializeExistingUser);
}
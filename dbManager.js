require("dotenv").config();
const pgp = require('pg-promise')();
const { PreparedStatement: PS } = require('pg-promise');
//This sets up the connection with the db
const dbCon = pgp(`postgres://${process.env.pgUsername}:${process.env.pgPassword}@localhost:5432/${process.env.pgDBName}`);


//Sets up db commands
module.exports={
	addUser:addUser
};

//Function for adding a user
function addUser(res, email, password) {
	//Creates prepared statement
	const insertNewUser = new PS({
		name: "insertUser",
		text: "INSERT INTO users (email, password) VALUES ($1, $2);",
		values: [email, password],
	});

	//Executes prepared statement
	return dbCon.none(insertNewUser);
}
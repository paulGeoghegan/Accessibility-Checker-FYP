require("dotenv").config();
const pgp = require('pg-promise')();
const { PreparedStatement: PS } = require('pg-promise');
//This sets up the connection with the db
const dbCon = pgp(`postgres://${process.env.pgUserName}:${process.env.password}@localhost:5432/${process.env.dbName}`);


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
	dbCon.none(insertNewUser).then(function() {
		console.log("New user added");
	}).catch(function(ex) {
		console.error(ex);
		return res.status(400).send(ex);
	});
}
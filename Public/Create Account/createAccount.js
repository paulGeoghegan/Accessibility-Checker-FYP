
//This will run when the form is submitted
$("#submitBtn").click(function() {
	//prepares data to be sent
	body= {
		email:$("#email")[0].value,
		password:$("#password")[0].value
	};
	//This sends the post request to the server
	$.post("/createAccount",body).done(accountCreated).fail(accountNotCreated);
});


function accountCreated() {
	console.log("User Added");
	//Sends post request to log user in
	$.post("/logIn",body).done(function() {
		console.log("You are now logged in");
		window.location.replace("/");
	}).fail(function(ex) {
		console.error(ex);
	});
}

function accountNotCreated(ex) {
	console.error(ex);
}

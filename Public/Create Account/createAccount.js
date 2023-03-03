
//This will run when the form is submitted
$("#submitBtn").click(function() {
	//prepares data to be sent
	let body= {
		email:$("#email")[0].value,
		password:$("#password")[0].value
	};
	//This sends the post request to the server
	$.post("/createAccount",body).done(function() {accountCreated(body)}).fail(accountNotCreated);
});


function accountCreated(body) {
	console.log("User Added");
	console.log(body.email);
	//Sends post request to log user in
	$.post("/logIn",body).done(function() {
		console.log("You are now logged in");
		window.location.replace("/");
	}).fail(function(ex,message) {
		console.error(ex,message);
	});
}

function accountNotCreated(ex,message) {
	console.error(ex);
}

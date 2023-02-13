
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
	window.location.replace("/");
}

function accountNotCreated(ex) {
	console.error(ex);
}


//This will run when the form is submitted
$("#submitBtn").click(function() {
	//prepares data to be sent
	body= {
		email:$("#email")[0].value,
		password:$("#password")[0].value
	};
	//This sends the post request to the server
	$.post("/login",body);
});

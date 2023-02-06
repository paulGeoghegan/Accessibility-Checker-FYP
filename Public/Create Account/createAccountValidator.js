
//This will validate the create account form and set rules for the input
$("#userDetails").validate({
	rules:{
		email:{
			required: true,
			email: true
		},
		password:{
		},
			required: true,
			minlength: 8,
			maxlength: 50
	},

	//Messages to be sent if rules arent met
	messages:{
		email:{
			required: "Please enter your email",
			email: "This is not a valid email"
		},
		password:{
			required: "Please enter your password",
			minlength: "Your password must be atleast 8 characters",
			maxlength: "Your passwort can't be more than 50 charactors"
		}
	},

	onfocusout: validateFields,
	submitHandler: createUser;

});

//This will validate the individual elements
function validateFields(element, event) {
	$(element).valid();
}

//This will attempt to create a user
function createUser() {

	userInfo = {
		email: $('#email')[0].value,
		password: $('#password')[0].value
	}

	//Tries to create a user
	try{
		const postForAddingUser = $.post("/addNewUser", userInfo);
		postForAddingUser.done(processResults);

		//Tries to log user in
		try{
			const postForLoggingUserIn = $.post("/logIn", userInfo);
			postForLoggingUserIn.done(processResults);
		} 
		catch{
			postForLoggingUserIn.fail(processErrors);
		}
	}
	catch{
		postForAddingUser.fail(processErrors);
	} 
} 

$('#submitBtn').click(function() {
	$('#userDetails').submit();
});

function processErrors(message, status, xhr) {
	console.log('Validation errors');
	console.log(message, "\n", status, "\n", xhr);
	$(`<p>${message.responseJSON.message}</p>`).appendTo("#userDetails");
}

function processResults() {
	console.log("User created and logged in");
}

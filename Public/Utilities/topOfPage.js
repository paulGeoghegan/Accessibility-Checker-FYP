
//This creates the nav bar
$("#topOfPage").append(`
		<a id="skipToContent" href="#middleOfPage"> Skip to content </a>

		</div>
		<h1>`+$("title").text()+`</h1>
		<nav>
			<a href="/">Home</a>
			<a href="/myreports">My Reports</a>
			<a href="/Learning">Learning</a>
		</nav>
		</br>
`);


//This will check if the user is logged in so we know which links should be added
const loggedIn = $.get("/isLoggedIn");
loggedIn.done(function(authenticated) {
	if(authenticated) {
		$("nav").append('<a class="accountLinks" href="/account">Account</a>');
	}
	else {
		$("nav").append('<a class="accountLinks" href="/createAccount">Create Account</a><a class="accountLinks" href="/logIn">Log In</a>');
	}
});


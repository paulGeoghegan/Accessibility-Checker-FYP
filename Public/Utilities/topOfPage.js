
//This creates the nav bar
$("#topOfPage").append(`
		<a id="skipToContent" href="#middleOfPage"> Skip to content </a>

		</div>
		<h1>`+$("title").text()+`</h1>
		<nav>
			<a href="/">Home</a>
			<a href="/myreports">My Reports</a>
		</nav>
		</br>
`);


//This will check if the user is logged in so we know which links should be added
const link = $.get("/isLoggedIn");
link.done(function(linksToAdd) {
		$("nav").append(linksToAdd);
});


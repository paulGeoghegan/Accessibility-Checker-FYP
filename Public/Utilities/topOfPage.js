
//This creates the nav bar
$("#topOfPage").append(`
		<a id="skipToContent" href="#middleOfPage"> Skip to content </a>
		<div id="loginLinks">
		</div>
		<h1>`+$("title").text()+`</h1>
		<nav>
			<a href="/">Home</a>
			<a href="/myreports">My Reports</a>
		</nav>
		</br>
`);

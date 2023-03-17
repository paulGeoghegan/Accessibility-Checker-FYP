
//This sends the request to log out the user
$("#logOutBtn").click(function() {
	$.ajax({url:"/logOut",type:"delete",success:window.location.replace("/")});
});

//This waits till the page has loaded
if(document.readyState) {
	$.get("/getUserEmail").done(function(user) {
		$("#middleOfPage").prepend("<p>Welcome "+user+"</p>");
	});
}
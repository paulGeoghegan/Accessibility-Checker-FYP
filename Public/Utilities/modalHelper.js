
function addModalListeners(id) {

	$("#"+id).click(function() {hideModal(id)});

	$("#"+id+"Content").click(function(event) {
		event.stopPropagation();
	});

	$("#"+id+"Close").click(function() {hideModal(id)});

}

function hideModal(id) {
	console.log(id)
	$("#"+id).css("display","none");
}

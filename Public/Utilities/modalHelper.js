
function addModalListeners(id) {

	$("#"+id).click(function() {hideModal(id)});

	$("#"+id+"Content").click(function(event) {
		event.stopPropagation();
	});

	$("#"+id+"Close").click(function() {hideModal(id)});

}

function hideModal(id) {
	$("#"+id).css("display","none");
}

function displayModal(id) {
	$(".modal").css("display","none");
	$("#"+id).css("display","flex");
	if($("#"+id+" input:text").length) {
		$("#"+id+" input:text").focus().select();
	}
	else {
		$("#"+id+"Content").focus();
	}
}

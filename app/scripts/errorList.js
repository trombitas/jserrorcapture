$(document).ready(function () {
	var request = function() {
		$.ajax({
			'type': 'post',
			'url': 'api/jserrorlogger/errorList.php',
			'success': function(data) {
				console.log('New errors: ', data);
			}
		});
	}
	setInterval( request, 2000 );
});
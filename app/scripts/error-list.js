$(document).ready(function () {
	var firstCall = true;
	var timeout = 2000;
	var interval;
	var request = function() {
		$.ajax({
			'type': 'post',
			'url': 'api/jserrorlogger/errorList.php',
			'data': 'firstcall='+firstCall,
			'success': function(data) {
				firstCall = false;
				populateTable(data);
			}
		});
	}
	var populateTable = function(data) {
		$('#errors tr').remove();
		data.forEach(function(row){
			var htmlRow = createRow(row);
			$('#errors').append(htmlRow);
			$('#errors tr:last').dblclick(function(){
				$("#formatText").html(row.format);
				$("#format").modal();
			})
		})
	}
	var createRow = function(row) {
		var htmlRow = '<tr><td>' + row.id + '</td><td>' + getDate(row.time) + '</td><td>' + row.error_type_name + '</td><td>' + row.message + '</td><td>' + row.file_name + '</td><td>' + row.line_number + '</td><td>' + row.col_number + '</td><td>' + row.os_name + '</td><td>' + row.width + '/' + row.height + '</td><td>' + row.browser_name + '</td><td>' + row.browser_version + '</td><td>' + row.orientatio_type + '</td><td>' + row.lang + '</td></tr>';
		return htmlRow;
	}
	var getDate = function(timestamp) {
		var date = new Date(parseInt(timestamp));
		return date.toUTCString();
	}
	var init = function() {
		request();
		interval = setInterval(request, timeout);
		$('#refreshTimeout').val(timeout);
		$('#refreshTimeout').on('change', function() {
			timeout = this.value;
			clearInterval(interval);
			interval = setInterval(request, timeout);
		});
	}
	init();
});
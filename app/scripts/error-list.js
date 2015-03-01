$(document).ready(function () {
	var firstCall = true;
	var timeout = 1000;
	var interval;
	var closeTimeout;
	var request = function() {
		$.ajax({
			'type': 'post',
			'url': 'api/jserrorlogger/errorList.php',
			'data': 'firstcall='+firstCall,
			'success': function(data) {
				firstCall = false;
				populateTable(data);
				clearTimeout(closeTimeout);
				
				$('#close-progress').stop().width('200px').animate({
					width: '0'
				}, 3000);
				
				$("#close-progress").parent().show();
				closeTimeout = setTimeout(function() {
					$("#format").modal('hide');
				}, 3000);
			}
		});
	}
	var populateTable = function(data) {
		$('#errors tr').remove();
		var firstRow;
		data.forEach(function(row){
			var htmlRow = createRow(row);
			firstRow = firstRow || row;
			$('#errors').append(htmlRow);
			$('#errors tr:last').dblclick(function() {
				displayWindow(row);
			});
		});
		displayWindow(firstRow);
	}
	var displayWindow = function(row){
		$("#formatText").html(row.format);
		$("#myModalLabel").html(row.message);
		try {	
			var obj = JSON.parse(row.format);
			var attrsList = $("#attrsList");
			attrsList.children("tbody").children("tr").remove();
			for(attr in obj) {
				if(obj.hasOwnProperty(attr)) {
					var htmlRow = '<tr><td width="160px"><b>' + stringFormatter(attr) + '</b></td><td>' + valueProcessing(attr, obj[attr]) + '</td></tr>';
					attrsList.append(htmlRow);
				}
			}
		} catch (e) {
		
		}
		$("#format").modal('show');
	}
	var valueProcessing = function(attr, value) {
		if(attr === 'time') {
			return getDate(value);
		}
		return value;
	}
	var stringFormatter = function (s) {
		s = s.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
		s = s.charAt(0).toUpperCase() + s.slice(1);
		return s;
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
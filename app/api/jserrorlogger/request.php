<?php 
    header('content-type: application/json; charset=utf-8');
	
	if (isset($_POST) && sizeof($_POST)) {
		print_r($_POST);
	}
	
	if (isset($_GET) && sizeof($_GET)) {
		print_r($_GET);
	}
	
    echo isset($_GET['callback'])
        ? "{$_GET['callback']}()"
        : null;
?>
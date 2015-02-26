<?php 
    header('content-type: application/json; charset=utf-8');
	
	if (isset($_POST)) {
		//print_r($_POST);
	}
	
    echo isset($_GET['callback'])
        ? "{$_GET['callback']}(null)"
        : null;
?>
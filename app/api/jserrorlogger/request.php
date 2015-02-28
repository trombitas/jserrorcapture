<?php 
	error_reporting(E_ERROR | E_WARNING);
    header('content-type: application/json; charset=utf-8');
	include_once 'util/Mysql.php';
	include_once 'util/ErrorLogger.php';

	$errorLogger = new ErrorLogger(sizeof($_POST) ? $_POST['errors'] : $_GET['errors']);
	
	if(isset($_GET['callback'])) {
		echo "{$_GET['callback']}(null)";
	}
?>
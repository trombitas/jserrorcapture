<?php 
    header('Access-Control-Allow-Origin: *');
	error_reporting(E_ERROR | E_WARNING);
	include_once 'util/Mysql.php';
	include_once 'util/ErrorLogger.php';

	if(sizeof($_POST))
		$data = $_POST;
	else if(sizeof($_GET))
		$data = $_GET;
	
	if($data['data']) {
		$json = json_decode($data['data'], true);
	} else {
		$json = $data;
	}
	
	$errorLogger = new ErrorLogger($json);
?>
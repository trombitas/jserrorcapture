<?php 
    header('Access-Control-Allow-Origin : *');
	error_reporting(E_ERROR | E_WARNING);
	
	include_once 'util/Mysql.php';
	include_once 'util/ErrorLogger.php';
	
	if(sizeof($_REQUEST))
		$data = $_REQUEST;
	else
		$data = @file_get_contents('php://input');
	
	echo var_dump($data['data']);
	
	if (is_string($data)) {
		$data = trim(preg_replace('/\s\s+/', ' ', $data));
		$json = json_decode($data, true);
	} else if($data['data'] != "undefined") {
		$json = json_decode($data['data'], true);
	} else {
		$json = $data;
	}

	$errorLogger = new ErrorLogger($json);
?>
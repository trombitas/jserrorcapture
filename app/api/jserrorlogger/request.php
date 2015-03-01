<?php 
    header('Access-Control-Allow-Origin : *');
	error_reporting(E_ERROR | E_WARNING);
	
	include_once 'util/Mysql.php';
	include_once 'util/ErrorLogger.php';
	
	$xmlContent = "";
	
	if(sizeof($_REQUEST))
		$data = $_REQUEST;
	else
		$data = @file_get_contents('php://input');
		
	if (is_string($data)) {
		$data = trim(preg_replace('/\s\s+/', ' ', $data));
		
		$xml = (array) simplexml_load_string($data);
		if(isset($xml[0]) and $xml[0] == false) {
			$json = json_decode($data, true);
		} else {
			$xmlContent = $data;
			$json = $xml;
		}
	} else if($data['data'] and $data['data'] != "undefined") {
		$json = json_decode($data['data'], true);
	} else {
		$json = $data;
	}
	
	if($json) {
		$json['stack'] = mysql_escape_string($json['stack']);
		unset($json['r0']);
		unset($json['r1']);
		$errorLogger = new ErrorLogger($json, $xmlContent);
	}
?>
<?php 
	error_reporting(E_ERROR | E_WARNING);
    header('content-type: application/json; charset=utf-8');
	include_once 'util/Mysql.php';
	include_once 'util/ErrorLogger.php';
	if(sizeof($_POST))
		$errorLogger = new ErrorLogger($_POST);
	else if(sizeof($_GET))
		$errorLogger = new ErrorLogger($_GET);
?>
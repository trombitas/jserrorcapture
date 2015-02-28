<?php
	error_reporting(E_ERROR | E_WARNING);
    header('content-type: application/json; charset=utf-8');
	include_once 'util/Mysql.php';
	
	$mysql = new Mysql();
	$mysql->dbConnect();
	
	$query = $mysql->query("select id from errors where displayed = 0");
	echo $mysql->rowsCount($query);
	$mysql->query("update errors set displayed='1'");
?>
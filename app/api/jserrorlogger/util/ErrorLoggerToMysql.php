<?php

require_once 'Mysql.php';

class ErrorLoggerToMysql {
	
	private $mysql;
	
	public function __construct() {}
	
	public function sendData($data) {
		$clientId = $data['clientId'] ? $data['clientId'] : 0;
		$browserOrientationId = $this->mysql->getData("browser_orientations", ['orientation_type' => $data['browserOrientation']], 'ID');
		$browserId = $this->mysql->getData("browsers", ['browser_name' => $data['browser']], 'ID');
		$osId = $this->mysql->getData("os", ['os_name' => $data['platform']], 'ID');
		$resolutionId = $this->mysql->getData("resolutions", ['width' => $data['width'], 'height' => $data['height']], 'ID');
		$error_type_name = explode(":", $data['message']);
		$errorTypeId = $this->mysql->getData("error_types", ['error_type_name' => $error_type_name[0]], 'ID');
		$message = $data['message'];
		$file_name = $data['filename'];
		$line_number = $data['lineNumber'];
		$col_number = $data['colNumber'];
		$this->mysql->query("insert into errors (client_id, browser_id, os_id, resolution_id, browser_orientation_id, error_type_id, message, file_name, line_number, col_number)
							values ('$clientId', '$browserId', '$osId', '$resolutionId', '$browserOrientationId', '$errorTypeId', '$message', '$file_name', '$line_number', '$col_number')");
	}
	
	public function openConnection() {
		$this->mysql = new Mysql();
		$this->mysql->dbConnect();
	}
	
	public function closeConnection() {
		$this->mysql->dbDisconnect();
	}
}
?>
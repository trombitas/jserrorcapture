<?php

require_once 'Mysql.php';
require_once 'BrowserDetection.php';
class ErrorLoggerToMysql {
	
	private $mysql;
	
	public function __construct() {}
	
	public function sendData($data) {
		$clientId = $data['clientId'] ? $data['clientId'] : 0;
		$browserOrientationId = $this->mysql->getData("browser_orientations", ['orientation_type' => $data['orientation']], 'ID');
		
		$browser = new BrowserDetection($data['browser']);
		$userBrowserName = $browser->getBrowser();
		$userBrowserVer = $browser->getVersion();
		$browserId = $this->mysql->getData("browsers", ['browser_name' => $userBrowserName, 'browser_version' => $userBrowserVer], 'ID');
		
		$osId = $this->mysql->getData("os", ['os_name' => $data['platform']], 'ID');
		$resolutionId = $this->mysql->getData("resolutions", ['width' => $data['resolutionWidth'], 'height' => $data['resolutionHeight']], 'ID');
		
		$error_type_name = explode(":", $data['message']);
		$errorTypeId = $this->mysql->getData("error_types", ['error_type_name' => $error_type_name[0]], 'ID');
		
		$message = $data['message'];
		$file_name = $data['filename'];
		$line_number = $data['lineNumber'];
		$col_number = $data['colNumber'];
		$time = $data['time'];
		$lang = $data['lang'];
		$format = $data['format'];
		$this->mysql->query("insert into errors (client_id, browser_id, os_id, resolution_id, browser_orientation_id, error_type_id, message, file_name, line_number, col_number, time, lang, format)
							values ('$clientId', '$browserId', '$osId', '$resolutionId', '$browserOrientationId', '$errorTypeId', '$message', '$file_name', '$line_number', '$col_number', '$time', '$lang', '$format')");
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
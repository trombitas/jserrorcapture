<?php

include_once 'ErrorLoggerToMysql.php';

class ErrorLogger extends ErrorLoggerToMysql{
	private $errorData = [];
	private $logErrorsTo;

	public function __construct($data) {
		$this->openConnection();
		$this->getData($data[0]);
		$this->sendData($this->errorData);
		$this->closeConnection();
	}
	
	private function getData($data) {
		if(is_array($data)) {
			foreach($data as $dataName => $value) {
				if(is_array($value)) {
					$this->getData($value);
				} else {
					$this->saveData($dataName, $value);
				}
			}
		} else {
			$this->saveData($data);
		}
	}
	
	private function saveData($dataName, $value) {
		$this->errorData[$dataName] = $value;
	}
}

?>
<?php

include_once 'ErrorLoggerToMysql.php';

class ErrorLogger extends ErrorLoggerToMysql{
	private $errorData = [];
	private $format;
	private $logErrorsTo;

	public function __construct($data) {
		$this->format = $data;
		$this->openConnection();
		$this->getData($data);
		$this->errorData['format'] = json_encode($this->format, JSON_PRETTY_PRINT);
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
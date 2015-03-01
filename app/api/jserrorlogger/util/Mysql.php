<?php

class Mysql {

	private $dbhandle;

    protected $serverName = 'sql303.byethost18.com';
    protected $userName = 'b18_15917402';
    protected $passCode = 'endava2015';
    protected $dbName = 'b18_15917402_jserrorlogger';

	function dbConnect() {
		$this->dbhandle = mysql_connect($this->serverName, $this->userName, $this->passCode) or die(mysql_error());
		$selected = mysql_select_db($this->dbName, $this->dbhandle) or die(mysql_error());	
	}

	function dbDisconnect() {
		mysql_close($this->dbhandle);
	}

	function query($query) {
		return mysql_query($query);
	}
	
	function rowsCount($query) {
		return mysql_num_rows($query);
	}
	
	function fetchAssoc($query) {
		return mysql_fetch_assoc($query);
	}
	
	function getData($tableName, $data, $returnedField) {
		
		$where = "";
		$insertFields = "";
		$insertValues = "";
		foreach($data as $name => $value) {
			if($name == "" or $value == "")
				return "";
			$where .= (($where != "" ? " and " : "") . "$name = '$value'");
			$insertFields .= (($insertFields != "" ? "," : "") . "$name");
			$insertValues .= (($insertValues != "" ? "," : "") . "'$value'");
		}

		$query = $this->query("select * from $tableName where $where");
		if(!$this->rowsCount($query)) {
			$this->query("insert into $tableName ($insertFields) values ($insertValues)");
			$query = $this->query("select * from $tableName where $where");
		}
		$data = $this->fetchAssoc($query);
		return $data[$returnedField];
	}
}
?>
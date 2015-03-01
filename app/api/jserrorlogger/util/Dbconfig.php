<?php

class Dbconfig {
	protected $serverName;
    protected $userName;
    protected $passCode;
    protected $dbName;

    function Dbconfig() {
        $this->serverName = 'sql303.byethost18.com';//'localhost';
        $this->userName = 'b18_15917402';//'root';
        $this->passCode = 'endava2015';//'';
        $this->dbName = 'jserrorlogger';//'jserrorlogger';
    }
}

?>